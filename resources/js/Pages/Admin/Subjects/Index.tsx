import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { ChevronDown, ChevronRight, Book, Bookmark, Plus } from 'lucide-react';
import { useState } from 'react';

// Define TS types based on our API resources
interface Chapter {
    id: string;
    name: string;
    subject_id: string;
}

interface Subject {
    id: string;
    name: string;
    code: string;
    chapters: Chapter[];
}

interface Props {
    subjects: {
        data: Subject[];
    };
}

export default function SubjectsIndex({ subjects }: Props) {
    const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);

    const toggleAccordion = (id: string) => {
        setExpandedSubjectId(expandedSubjectId === id ? null : id);
    };

    return (
        <AdminLayout header={
            <div className="flex justify-between items-center">
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">Academic Structure</h2>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition flex items-center gap-2">
                    <Plus size={16} /> New Subject
                </button>
            </div>
        }>
            <Head title="Subjects & Chapters" />

            <div className="py-4 max-w-5xl mx-auto">
                <div className="bg-white rounded-lg shadow ring-1 ring-black ring-opacity-5 divide-y divide-gray-200">
                    {subjects?.data?.length > 0 ? subjects.data.map((subject) => (
                        <div key={subject.id} className="bg-white">
                            <button
                                onClick={() => toggleAccordion(subject.id)}
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition focus:outline-none"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                                        <Book size={20} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-sm font-medium text-gray-900">{subject.name}</h3>
                                        <span className="text-xs text-gray-500">Code: {subject.code} • {subject.chapters?.length || 0} Chapters</span>
                                    </div>
                                </div>
                                <div>
                                    {expandedSubjectId === subject.id ? (
                                        <ChevronDown className="text-gray-400" size={20} />
                                    ) : (
                                        <ChevronRight className="text-gray-400" size={20} />
                                    )}
                                </div>
                            </button>

                            {/* Accordion Content */}
                            {expandedSubjectId === subject.id && (
                                <div className="px-6 pb-4 pt-2 bg-slate-50 border-t border-gray-100 pl-16">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Chapters</h4>
                                        <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Add Chapter</button>
                                    </div>

                                    {subject.chapters && subject.chapters.length > 0 ? (
                                        <ul className="space-y-2">
                                            {subject.chapters.map((chapter) => (
                                                <li key={chapter.id} className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200 shadow-sm hover:border-indigo-300 transition">
                                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                                        <Bookmark className="text-gray-400" size={16} />
                                                        {chapter.name}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button className="text-indigo-500 hover:text-indigo-700 text-xs font-medium focus:outline-none">Edit</button>
                                                        <button className="text-red-500 hover:text-red-700 text-xs font-medium focus:outline-none">Delete</button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic py-2">No chapters found for this subject.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="p-8 text-center text-gray-500">
                            <Book className="mx-auto text-gray-400 mb-3" size={40} />
                            <p>No subjects have been created yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
