import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, CheckCircle, ChevronRight, ChevronLeft, WifiOff, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

export default function ExamRoom({ exam, attempt }: any) {
    // --- 1. Timing Logic ---
    const calculateTimeLeft = useCallback(() => {
        const end = new Date(attempt.end_time).getTime();
        const now = new Date().getTime();
        const diff = Math.floor((end - now) / 1000);
        return diff > 0 ? diff : 0;
    }, [attempt.end_time]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- 2. Offline Resilience State ---
    const localKey = `exam_answers_${attempt.id}`;

    const loadInitialAnswers = () => {
        const serverAnswers: Record<string, string> = {};
        if (attempt.answers) {
            attempt.answers.forEach((ans: any) => {
                if (ans.selected_option_id) {
                    serverAnswers[ans.question_id] = ans.selected_option_id;
                }
            });
        }

        if (typeof window !== 'undefined') {
            try {
                const localData = localStorage.getItem(localKey);
                if (localData) {
                    const localAnswers = JSON.parse(localData);
                    return { ...serverAnswers, ...localAnswers };
                }
            } catch (e) {
                console.error("Failed to parse local storage answers", e);
            }
        }
        return serverAnswers;
    };

    const [answers, setAnswers] = useState<Record<string, string>>(loadInitialAnswers);
    const [viewedQuestions, setViewedQuestions] = useState<Set<number>>(new Set([0]));
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

    // --- 3. Anti-Cheat State ---
    const [warningCount, setWarningCount] = useState(0);
    const [showWarningModal, setShowWarningModal] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // --- CSRF Keep Alive ---
    useEffect(() => {
        // Ping the server every 15 minutes to keep the session alive
        const keepAliveInterval = setInterval(() => {
            axios.get('/sanctum/csrf-cookie').catch(() => {});
        }, 15 * 60 * 1000);

        return () => clearInterval(keepAliveInterval);
    }, []);

    // --- Network Watcher ---
    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            // Optionally sync pending local answers when online
            Object.entries(answers).forEach(([qId, oId]) => {
                axios.post(route('student.attempts.save-answer', attempt.id), {
                    question_id: qId,
                    selected_option_id: oId
                }).catch(() => { });
            });
        };
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [answers, attempt.id]);

    // --- Timer Tick ---
    useEffect(() => {
        if (timeLeft <= 0 && !isSubmitting) {
            submitExam("Time has expired. Your exam is being submitted automatically.");
            return;
        }

        timerRef.current = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timeLeft, isSubmitting, calculateTimeLeft]);

    // --- Anti-Cheat Engine (Page Visibility) ---
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && !isSubmitting && timeLeft > 0) {
                setWarningCount(prev => {
                    const next = prev + 1;
                    if (next >= 3) {
                        submitExam("Anti-cheat enforcement: Maximum tab switches exceeded.");
                    } else {
                        setShowWarningModal(true);
                    }
                    return next;
                });
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [isSubmitting, timeLeft]);

    // --- Interaction Handlers ---
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

        const newAnswers = { ...answers, [questionId]: optionId };
        setAnswers(newAnswers);

        // Save to LocalStorage defensively
        localStorage.setItem(localKey, JSON.stringify(newAnswers));

        if (!isOffline) {
            try {
                await axios.post(route('student.attempts.save-answer', attempt.id), {
                    question_id: questionId,
                    selected_option_id: optionId
                });
            } catch (error) {
                console.error("Failed to auto-save answer", error);
            }
        }
    };

    const submitExam = (reason?: string) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        if (timerRef.current) clearInterval(timerRef.current);

        // Clear local storage
        localStorage.removeItem(localKey);

        if (reason) {
            alert(reason);
        }

        router.post(route('student.attempts.submit', attempt.id), {}, {
            onFinish: () => setIsSubmitting(false)
        });
    };

    const questions = exam.questions;
    const currentQuestionDetail = questions[currentQuestionIndex]?.question;

    useEffect(() => {
        setViewedQuestions(prev => new Set(prev).add(currentQuestionIndex));
    }, [currentQuestionIndex]);

    if (!currentQuestionDetail) return <div>Loading exam engine...</div>;

    const isTimerCritical = timeLeft < 300 && timeLeft > 0; // Less than 5 minutes

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none pb-20">
            <Head title={`Exam Room - ${exam.title}`} />

            {/* Anti-Cheat Modal */}
            <Dialog open={showWarningModal} onOpenChange={(open) => {
                // Prevent user from dismissing the modal by clicking outside
                // They must click the required Button
                if (open) setShowWarningModal(true);
            }}>
                <DialogContent className="sm:max-w-md [&>button.absolute]:hidden">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2 text-xl pb-2 border-b">
                            <ShieldAlert className="h-6 w-6" />
                            Security Warning: Tab Switch Detected
                        </DialogTitle>
                        <DialogDescription className="text-base text-slate-700 leading-relaxed pt-2">
                            You have switched tabs or left the exam window. This is a violation of the strict exam environment rules.
                            <br /><br />
                            <span className="font-semibold text-red-600">Warning {warningCount} of 3.</span> After 3 warnings, your exam will be automatically submitted without further notice.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-start">
                        <Button type="button" variant="destructive" onClick={() => setShowWarningModal(false)} className="w-full sm:w-auto font-semibold">
                            I Understand, Return to Exam
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Sticky Header & Premium Timer */}
            <header className="bg-white/90 backdrop-blur-md shadow-sm border-b sticky top-0 z-40 transition-all border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">{exam.title}</h1>
                        {isOffline && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-amber-700 bg-amber-50 py-1 px-2.5 rounded-md w-fit border border-amber-200 shadow-sm animate-pulse">
                                <WifiOff size={14} /> Offline Mode - Answers saved locally
                            </div>
                        )}
                    </div>

                    <div className={`flex items-center justify-center gap-2 px-6 py-2 rounded-full font-mono text-xl font-bold border-2 transition-all shadow-sm ${isTimerCritical
                            ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                        <Clock size={20} className={isTimerCritical ? 'text-red-500' : 'text-slate-500'} />
                        {timeLeft <= 0 ? '00:00' : formatTime(timeLeft)}
                    </div>
                </div>
            </header>

            {/* Main Application Layout */}
            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

                {/* Left Area (Actual Question view) - lg:col-span-3 */}
                <div className="lg:col-span-3 lg:order-1 order-2">
                    <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden flex flex-col min-h-[550px]">

                        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-center gap-4">
                            <span className="font-bold text-indigo-700 text-lg">Question {currentQuestionIndex + 1} <span className="text-slate-400 font-medium">of {questions.length}</span></span>
                            <div className="flex items-center gap-4 text-sm font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
                                <span>Marks: <span className="text-emerald-600">+{currentQuestionDetail.marks}</span></span>
                                {exam.negative_enabled && <span className="text-red-500 border-l border-slate-200 pl-3">-{currentQuestionDetail.negative_marks}</span>}
                            </div>
                        </div>

                        <div className="p-8 flex-1">
                            {/* Question Body */}
                            <h2 className="text-xl text-slate-900 font-medium mb-8 leading-relaxed whitespace-pre-wrap selection:bg-indigo-100 selection:text-indigo-900">
                                {currentQuestionDetail.question_text}
                            </h2>

                            {currentQuestionDetail.question_image && (
                                <div className="mb-10">
                                    <img src={`/storage/${currentQuestionDetail.question_image}`} alt="Question visual" className="max-w-full max-h-80 object-contain rounded-xl border border-slate-200 shadow-sm" draggable="false" />
                                </div>
                            )}

                            {/* Options Mapping */}
                            <div className="space-y-4">
                                {currentQuestionDetail.options.map((opt: any) => {
                                    const isSelected = answers[currentQuestionDetail.id] === opt.id;
                                    return (
                                        <label
                                            key={opt.id}
                                            className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${isSelected
                                                    ? 'border-indigo-600 bg-indigo-50/60 shadow-md ring-1 ring-indigo-600/30 ring-offset-1 z-10 relative'
                                                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80 hover:shadow-sm'
                                                }`}
                                        >
                                            <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 shrink-0 transition-colors ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                                                {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                            </div>
                                            <input
                                                type="radio"
                                                name={`question-${currentQuestionDetail.id}`}
                                                className="hidden"
                                                checked={isSelected}
                                                onChange={() => handleOptionSelect(currentQuestionDetail.id, opt.id)}
                                                disabled={isSubmitting}
                                            />
                                            <div className="ml-5 flex flex-col sm:flex-row sm:items-center gap-4 w-full">
                                                {opt.option_image && (
                                                    <img src={`/storage/${opt.option_image}`} alt="Option visual" className="h-20 w-20 object-cover rounded-md border shadow-sm" draggable="false" />
                                                )}
                                                <span className={`text-lg transition-colors ${isSelected ? 'text-indigo-950 font-semibold' : 'text-slate-700'}`}>
                                                    {opt.option_text}
                                                </span>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Navigation Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-center gap-4 mt-auto">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0 || isSubmitting}
                                className="px-6 py-6 text-base font-semibold shadow-sm text-slate-600 hover:text-slate-900"
                            >
                                <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                            </Button>

                            {currentQuestionIndex < questions.length - 1 ? (
                                <Button
                                    onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                    disabled={isSubmitting}
                                    className="px-8 py-6 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
                                >
                                    Next Question <ChevronRight className="ml-2 h-5 w-5" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => submitExam()}
                                    disabled={isSubmitting}
                                    className="px-8 py-6 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 tracking-wide"
                                >
                                    {isSubmitting ? 'Submitting Score...' : 'Finish & Submit Exam'} <CheckCircle className="ml-2 h-5 w-5" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Area (Premium Question Nav Grid) - lg:col-span-1 */}
                <div className="lg:col-span-1 lg:order-2 order-1">
                    <div className="bg-white shadow-sm rounded-xl border border-slate-200 p-6 sticky top-28">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800 tracking-tight text-lg">Questions Map</h3>
                            <span className="text-sm font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm">
                                {Object.keys(answers).length} / {questions.length}
                            </span>
                        </div>

                        <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-2.5 max-h-[300px] overflow-y-auto pr-1 pb-2 custom-scrollbar">
                            {questions.map((q: any, idx: number) => {
                                const qid = q.question.id;
                                const isAnswered = !!answers[qid];
                                const isViewed = viewedQuestions.has(idx);
                                const isSkipped = isViewed && !isAnswered && idx !== currentQuestionIndex;
                                const isCurrent = currentQuestionIndex === idx;

                                let btnClass = "bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:border-indigo-300"; // Unanswered/Unviewed

                                if (isCurrent && isAnswered) {
                                    btnClass = "bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-600/20 ring-offset-1";
                                } else if (isCurrent && !isAnswered) {
                                    btnClass = "bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-600/20 ring-offset-1 animate-pulse";
                                } else if (isAnswered) {
                                    btnClass = "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 shadow-sm";
                                } else if (isSkipped) {
                                    btnClass = "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300 shadow-sm";
                                }

                                return (
                                    <button
                                        key={qid}
                                        onClick={() => setCurrentQuestionIndex(idx)}
                                        className={`w-full aspect-square rounded-[10px] flex items-center justify-center font-bold text-sm border-2 transition-all ${btnClass}`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Status Legend */}
                        <div className="mt-6 pt-5 border-t border-slate-100 font-semibold space-y-3.5 text-sm text-slate-600">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-slate-700">
                                    <div className="w-5 h-5 rounded-md bg-emerald-50 border-2 border-emerald-300 shadow-sm"></div> Answered
                                </div>
                                <span className="font-bold">{Object.keys(answers).length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-slate-700">
                                    <div className="w-5 h-5 rounded-md bg-red-50 border-2 border-red-200 shadow-sm"></div> Skipped
                                </div>
                                {/* Calculate visually skipped logic */}
                                <span className="font-bold">
                                    {Array.from(viewedQuestions).filter(idx => !answers[questions[idx].question.id] && idx !== currentQuestionIndex).length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between opacity-60">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="w-5 h-5 rounded-md bg-white border-2 border-slate-200"></div> Unviewed
                                </div>
                                <span className="font-bold">{questions.length - viewedQuestions.size}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

