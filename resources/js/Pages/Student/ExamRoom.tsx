import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import axios from 'axios';

export default function ExamRoom({ exam, attempt }: any) {
    const calculateTimeLeft = () => {
        const end = new Date(attempt.end_time).getTime();
        const now = new Date().getTime();
        const diff = Math.floor((end - now) / 1000);
        return diff > 0 ? diff : 0;
    };

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize answers from existing attempt (if user refreshed)
    const initialAnswers: Record<string, string> = {};
    if (attempt.answers) {
        attempt.answers.forEach((ans: any) => {
            if (ans.selected_option_id) {
                initialAnswers[ans.question_id] = ans.selected_option_id;
            }
        });
    }
    const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Timer Effect
    useEffect(() => {
        if (timeLeft <= 0) {
            submitExam();
            return;
        }

        timerRef.current = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timeLeft]);

    // Format time
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleOptionSelect = async (questionId: string, optionId: string) => {
        if (isSubmitting) return;

        // Optimistic UI update
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));

        try {
            // Auto-save via background request
            await axios.post(route('student.attempts.save-answer', attempt.id), {
                question_id: questionId,
                selected_option_id: optionId
            });
        } catch (error) {
            console.error("Failed to auto-save answer", error);
        }
    };

    const submitExam = () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        if (timerRef.current) clearInterval(timerRef.current);

        router.post(route('student.attempts.submit', attempt.id), {}, {
            onFinish: () => setIsSubmitting(false)
        });
    };

    const questions = exam.questions;
    const currentQuestionDetail = questions[currentQuestionIndex]?.question;

    if (!currentQuestionDetail) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Head title="Exam Room" />

            {/* Header / Nav */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">{exam.title}</h1>
                    </div>

                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-semibold ${timeLeft < 300 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
                        <Clock size={20} />
                        {timeLeft <= 0 ? '00:00' : formatTime(timeLeft)}
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
                            {questions.map((q: any, idx: number) => {
                                const qid = q.question.id;
                                return (
                                    <button
                                        key={qid}
                                        onClick={() => setCurrentQuestionIndex(idx)}
                                        className={`w-10 h-10 rounded-md flex items-center justify-center font-medium transition-colors ${currentQuestionIndex === idx
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : answers[qid]
                                                ? 'bg-green-100 text-green-700 border border-green-300'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
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
                            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                                <span>Marks: {currentQuestionDetail.marks}</span>
                                {exam.negative_enabled && <span>(-{currentQuestionDetail.negative_marks})</span>}
                            </div>
                        </div>

                        <div className="p-8 flex-1">
                            <h2 className="text-xl text-slate-800 font-medium mb-8 leading-relaxed whitespace-pre-wrap">
                                {currentQuestionDetail.question_text}
                            </h2>

                            {currentQuestionDetail.question_image && (
                                <div className="mb-8">
                                    <img src={`/storage/${currentQuestionDetail.question_image}`} alt="Question visual" className="max-w-full max-h-64 object-contain rounded-md border" />
                                </div>
                            )}

                            <div className="space-y-4">
                                {currentQuestionDetail.options.map((opt: any) => (
                                    <label
                                        key={opt.id}
                                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${answers[currentQuestionDetail.id] === opt.id
                                            ? 'border-indigo-500 bg-indigo-50 shadow-sm ring-1 ring-indigo-500'
                                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${currentQuestionDetail.id}`}
                                            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                            checked={answers[currentQuestionDetail.id] === opt.id}
                                            onChange={() => handleOptionSelect(currentQuestionDetail.id, opt.id)}
                                            disabled={isSubmitting}
                                        />
                                        <div className="ml-4 flex items-center gap-4">
                                            {opt.option_image && (
                                                <img src={`/storage/${opt.option_image}`} alt="Option visual" className="h-16 w-16 object-cover rounded border" />
                                            )}
                                            <span className="text-slate-700 text-lg">{opt.option_text}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t bg-slate-50 flex justify-between items-center mt-auto">
                            <button
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0 || isSubmitting}
                                className="px-6 py-2.5 rounded-md font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2 transition"
                            >
                                <ChevronLeft size={20} /> Previous
                            </button>

                            {currentQuestionIndex < questions.length - 1 ? (
                                <button
                                    onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                    disabled={isSubmitting}
                                    className="px-8 py-2.5 rounded-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center gap-2 transition focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    Next <ChevronRight size={20} />
                                </button>
                            ) : (
                                <button
                                    onClick={submitExam}
                                    disabled={isSubmitting}
                                    className="px-8 py-2.5 rounded-md font-medium text-white bg-green-600 hover:bg-green-700 shadow-sm flex items-center gap-2 transition focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                    <CheckCircle size={20} />
                                    {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
