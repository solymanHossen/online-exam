import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Trash, Image as ImageIcon } from 'lucide-react';

interface OptionForm {
    option_text: string;
    option_image: File | null;
    is_correct: boolean;
}

export default function QuestionForm() {
    // Initializing form with 4 default empty options
    const [options, setOptions] = useState<OptionForm[]>([
        { option_text: '', option_image: null, is_correct: true },
        { option_text: '', option_image: null, is_correct: false },
        { option_text: '', option_image: null, is_correct: false },
        { option_text: '', option_image: null, is_correct: false },
    ]);

    const { data, setData, post, processing, errors } = useForm({
        subject_id: '',
        chapter_id: '',
        question_text: '',
        question_image: null as File | null,
        explanation: '',
        difficulty: 'medium',
        marks: 1.00,
        negative_marks: 0.00,
        // Options will be processed separately or passed as JSON depending on backend setup
    });

    const addOption = () => {
        setOptions([...options, { option_text: '', option_image: null, is_correct: false }]);
    };

    const removeOption = (index: number) => {
        if (options.length <= 2) return; // Prevent removing below minimum
        const newOptions = [...options];
        newOptions.splice(index, 1);
        setOptions(newOptions);
    };

    const updateOption = (index: number, field: keyof OptionForm, value: any) => {
        const newOptions = [...options];

        // If setting is_correct, we typically want only one correct answer (Single Choice)
        // For Multiple Choice, remove this block
        if (field === 'is_correct' && value === true) {
            newOptions.forEach(opt => opt.is_correct = false);
        }

        newOptions[index] = { ...newOptions[index], [field]: value };
        setOptions(newOptions);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real scenario, we use formData to append options
        // post('/admin/questions');
        console.log("Submitting", { ...data, options });
    };

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Create Question</h2>}>
            <Head title="Create Question" />

            <div className="max-w-4xl mx-auto py-6">
                <form onSubmit={submit} className="bg-white p-6 rounded-lg shadow space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Subject</label>
                            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                <option value="">Select Subject</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Chapter</label>
                            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                <option value="">Select Chapter</option>
                            </select>
                        </div>
                    </div>

                    {/* Question Content */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Question Content</label>
                        <textarea
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Type your question here..."
                            value={data.question_text}
                            onChange={(e) => setData('question_text', e.target.value)}
                        />
                    </div>

                    {/* Options Array */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-medium text-gray-700">Answers / Options</label>
                            <button type="button" onClick={addOption} className="text-sm flex items-center gap-1 text-indigo-600 hover:text-indigo-800">
                                <Plus size={16} /> Add Option
                            </button>
                        </div>

                        <div className="space-y-3">
                            {options.map((option, index) => (
                                <div key={index} className={`flex items-start gap-4 p-4 rounded-md border ${option.is_correct ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'}`}>
                                    <div className="pt-2">
                                        <input
                                            type="radio"
                                            name="correct_answer"
                                            checked={option.is_correct}
                                            onChange={() => updateOption(index, 'is_correct', true)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            placeholder={`Option ${index + 1}`}
                                            value={option.option_text}
                                            onChange={(e) => updateOption(index, 'option_text', e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className="mt-1 text-gray-400 hover:text-gray-600"
                                        title="Attach Image"
                                    >
                                        <ImageIcon size={20} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeOption(index)}
                                        disabled={options.length <= 2}
                                        className={`mt-1 ${options.length <= 2 ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:text-red-600'}`}
                                    >
                                        <Trash size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="grid grid-cols-3 gap-6 pt-4 border-t">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                            <select
                                value={data.difficulty}
                                onChange={(e) => setData('difficulty', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Marks</label>
                            <input type="number" step="0.5" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" value={data.marks} onChange={e => setData('marks', parseFloat(e.target.value))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Negative Marks</label>
                            <input type="number" step="0.1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" value={data.negative_marks} onChange={e => setData('negative_marks', parseFloat(e.target.value))} />
                        </div>
                    </div>

                    <div className="pt-4 border-t flex justify-end gap-3">
                        <button type="button" className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Save Question
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
