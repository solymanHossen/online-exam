import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';

// Mock types
interface Option {
    id: string;
    option_text: string;
}

interface Question {
    id: string;
    question_text: string;
    options: Option[];
}

export default function ExamRoom() {
    // Mock Data
    const exam = {
        title: 'Midterm Evaluation',
        duration_minutes: 60,
    };

    const questions: Question[] = [
        {
            id: '1',
            question_text: 'What is the powerhouse of the cell?',
            options: [
                { id: 'o1', option_text: 'Nucleus' },
                { id: 'o2', option_text: 'Mitochondria' },
                { id: 'o3', option_text: 'Ribosome' }
            ]
        },
        {
            id: '2',
            question_text: 'What is O(log n) in Big O Notation?',
            options: [
                { id: 'o4', option_text: 'Linear Time' },
                { id: 'o5', option_text: 'Logarithmic Time' },
                { id: 'o6', option_text: 'Constant Time' }
            ]
        }
    ];

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(exam.duration_minutes * 60);

    // Timer Effect
    useEffect(() => {
        if (timeLeft <= 0) {
            submitExam();
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft]);

    // Format time
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleOptionSelect = (questionId: string, optionId: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
        // Could trigger API Auto-Save here
    };

    const submitExam = () => {
        console.log('Submitting Exam', answers);
        alert('Exam Submitted Successfully!');
    };

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Head title="Exam Room" />

            {/* Header / Nav */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">{exam.title}</h1>
                        <p className="text-sm text-slate-500">Do not refresh this page.</p>
                    </div>

                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-semibold ${timeLeft < 300 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
                        <Clock size={20} />
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Left Area (Question Nav) */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="bg-white shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg p-5 sticky top-24">
                        <h3 className="font-semibold text-slate-800 mb-4 border-b pb-2">Questions Map</h3>
                        <div className="grid grid-cols-5 gap-2">
                            {questions.map((q, idx) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQuestionIndex(idx)}
                                    className={`w-10 h-10 rounded-md flex items-center justify-center font-medium transition-colors ${currentQuestionIndex === idx
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : answers[q.id]
                                                ? 'bg-green-100 text-green-700 border border-green-300'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 space-y-2 text-sm text-slate-600">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-green-100 border border-green-300"></div> Attempted</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-slate-100"></div> Unattempted</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-indigo-600"></div> Current</div>
                        </div>
                    </div>
                </div>

                {/* Right Area (Actual Question view) */}
                <div className="lg:col-span-3">
                    <div className="bg-white shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg overflow-hidden flex flex-col h-full min-h-[500px]">

                        <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
                            <span className="font-semibold text-indigo-700">Question {currentQuestionIndex + 1} of {questions.length}</span>
                            <span className="text-sm font-medium text-slate-500 hover:text-indigo-600 cursor-pointer flex items-center gap-1">
                                <AlertTriangle size={16} /> Report Issue
                            </span>
                        </div>

                        <div className="p-8 flex-1">
                            <h2 className="text-xl text-slate-800 font-medium mb-8 leading-relaxed">
                                {currentQuestion.question_text}
                            </h2>

                            <div className="space-y-4">
                                {currentQuestion.options.map((opt) => (
                                    <label
                                        key={opt.id}
                                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${answers[currentQuestion.id] === opt.id
                                                ? 'border-indigo-500 bg-indigo-50 shadow-sm ring-1 ring-indigo-500'
                                                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${currentQuestion.id}`}
                                            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                            checked={answers[currentQuestion.id] === opt.id}
                                            onChange={() => handleOptionSelect(currentQuestion.id, opt.id)}
                                        />
                                        <span className="ml-4 text-slate-700 text-lg">{opt.option_text}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t bg-slate-50 flex justify-between items-center mt-auto">
                            <button
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0}
                                className="px-6 py-2.5 rounded-md font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2 transition"
                            >
                                <ChevronLeft size={20} /> Previous
                            </button>

                            {currentQuestionIndex < questions.length - 1 ? (
                                <button
                                    onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                    className="px-8 py-2.5 rounded-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center gap-2 transition focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Next <ChevronRight size={20} />
                                </button>
                            ) : (
                                <button
                                    onClick={submitExam}
                                    className="px-8 py-2.5 rounded-md font-medium text-white bg-green-600 hover:bg-green-700 shadow-sm flex items-center gap-2 transition focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    <CheckCircle size={20} /> Submit Exam
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
