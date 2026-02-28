import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { GripVertical, Plus, Trash2, Search, Settings } from 'lucide-react';

interface Question {
    id: string;
    question_text: string;
    difficulty: string;
    marks: number;
}

export default function ExamBuilder() {
    const { data, setData, post, processing } = useForm({
        title: '',
        description: '',
        duration_minutes: 60,
        pass_marks: 30,
        negative_enabled: false,
        shuffle_questions: true,
        start_time: '',
        end_time: '',
        status: 'draft',
    });

    // Mocks for UI representation
    const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
    const [availableQuestions, setAvailableQuestions] = useState<Question[]>([
        { id: '1', question_text: 'What is photosynthesis?', difficulty: 'medium', marks: 2 },
        { id: '2', question_text: 'Explain quantum entanglement.', difficulty: 'hard', marks: 5 },
        { id: '3', question_text: 'Who wrote Hamlet?', difficulty: 'easy', marks: 1 },
    ]);
    const [searchTerm, setSearchTerm] = useState('');

    const addQuestion = (question: Question) => {
        if (!selectedQuestions.find(q => q.id === question.id)) {
            setSelectedQuestions([...selectedQuestions, question]);
        }
    };

    const removeQuestion = (id: string) => {
        setSelectedQuestions(selectedQuestions.filter(q => q.id !== id));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Saving exam with questions
    };

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Exam Builder</h2>}>
            <Head title="Exam Builder" />

            <div className="max-w-7xl mx-auto py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Exam Settings Form */}
                <div className="lg:col-span-1 space-y-6">
                    <form onSubmit={submit} className="bg-white p-5 rounded-lg shadow ring-1 ring-black ring-opacity-5">
                        <div className="flex items-center gap-2 border-b pb-3 mb-4 text-indigo-900 font-semibold">
                            <Settings size={20} /> Exam Configuration
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Exam Title</label>
                                <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Duration (mins)</label>
                                    <input type="number" value={data.duration_minutes} onChange={e => setData('duration_minutes', parseInt(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Pass Marks</label>
                                    <input type="number" value={data.pass_marks} onChange={e => setData('pass_marks', parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select value={data.status} onChange={e => setData('status', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm">
                                    <option value="draft">Draft (Hidden)</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>

                            <div className="pt-2 border-t space-y-3">
                                <label className="flex items-center">
                                    <input type="checkbox" checked={data.shuffle_questions} onChange={e => setData('shuffle_questions', e.target.checked)} className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500" />
                                    <span className="ml-2 pl-1 text-sm text-gray-600">Shuffle Questions</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="checkbox" checked={data.negative_enabled} onChange={e => setData('negative_enabled', e.target.checked)} className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500" />
                                    <span className="ml-2 pl-1 text-sm text-gray-600">Enable Negative Marking</span>
                                </label>
                            </div>

                            <button type="submit" disabled={processing} className="w-full mt-4 bg-indigo-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                                Save Exam & Format
                            </button>
                        </div>
                    </form>
                </div>

                {/* Middle Column: Selected Questions (The Builder) */}
                <div className="lg:col-span-1 bg-white p-5 rounded-lg shadow ring-1 ring-black ring-opacity-5 flex flex-col h-[calc(100vh-140px)]">
                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                        <h3 className="text-indigo-900 font-semibold">Selected Questions</h3>
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {selectedQuestions.length} Total
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {selectedQuestions.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <p className="text-sm">No questions selected yet.</p>
                                <p className="text-xs mt-1">Select from the bank on the right.</p>
                            </div>
                        ) : (
                            selectedQuestions.map((q, index) => (
                                <div key={q.id} className="group bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-start gap-3 hover:shadow-md transition">
                                    <div className="text-slate-400 cursor-move mt-1">
                                        <GripVertical size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <span className="text-xs font-semibold text-slate-500">Q{index + 1}</span>
                                            <span className="text-xs font-medium bg-green-100 text-green-700 px-1.5 rounded">{q.marks} pts</span>
                                        </div>
                                        <p className="text-sm text-slate-800 mt-1 line-clamp-2">{q.question_text}</p>
                                    </div>
                                    <button
                                        onClick={() => removeQuestion(q.id)}
                                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition focus:outline-none"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column: Question Bank */}
                <div className="lg:col-span-1 bg-white p-5 rounded-lg shadow ring-1 ring-black ring-opacity-5 flex flex-col h-[calc(100vh-140px)]">
                    <div className="border-b pb-3 mb-4">
                        <h3 className="text-indigo-900 font-semibold mb-3">Question Bank</h3>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Search questions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {availableQuestions.filter(q => q.question_text.toLowerCase().includes(searchTerm.toLowerCase())).map((q) => (
                            <div key={q.id} className="bg-white border border-gray-200 p-3 rounded-lg flex items-start justify-between hover:border-indigo-300 transition">
                                <div className="flex-1 pr-3">
                                    <div className="flex gap-2 mb-1">
                                        <span className={`text-[10px] uppercase font-bold px-1.5 rounded border ${q.difficulty === 'easy' ? 'bg-green-50 text-green-600 border-green-200' :
                                            q.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                                                'bg-red-50 text-red-600 border-red-200'
                                            }`}>
                                            {q.difficulty}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 line-clamp-2">{q.question_text}</p>
                                </div>
                                <button
                                    onClick={() => addQuestion(q)}
                                    disabled={!!selectedQuestions.find(sq => sq.id === q.id)}
                                    className={`p-1.5 rounded-md ${selectedQuestions.find(sq => sq.id === q.id)
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                        }`}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
