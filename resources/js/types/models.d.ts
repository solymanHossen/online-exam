export interface ExamOption {
    id: string;
    option_text: string;
    option_image?: string | null;
}

export type EntityStatus = 'active' | 'inactive' | boolean;

export interface Batch {
    id: string;
    name: string;
    description?: string | null;
    status?: EntityStatus;
    class_level?: string | null;
    year?: number | null;
    created_at?: string | null;
}

export interface Chapter {
    id: string;
    subject_id: string;
    name: string;
    order?: number | null;
    description?: string | null;
    created_at?: string | null;
    subject?: Pick<Subject, 'id' | 'name' | 'code'> | null;
}

export interface Subject {
    id: string;
    name: string;
    code: string;
    description?: string | null;
    status?: EntityStatus;
    batch_ids?: string[];
    batches?: Batch[];
    chapters?: Chapter[];
    created_at?: string | null;
}

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export type QuestionType = 'mcq' | 'true_false' | 'fill_blank';

export interface QuestionOption {
    id?: string;
    option_text: string;
    option_image?: string | null;
    option_image_path?: string | null;
    is_correct?: boolean;
}

export interface MaterialAttachment {
    id?: string;
    title: string;
    file_url: string;
    mime_type?: string | null;
}

export interface Question {
    id: string;
    subject_id: string;
    chapter_id: string;
    question_text: string;
    explanation?: string | null;
    difficulty: QuestionDifficulty;
    question_type?: QuestionType;
    marks: number | string;
    negative_marks: number | string;
    question_image?: string | null;
    question_image_path?: string | null;
    is_active?: boolean;
    subject?: Pick<Subject, 'id' | 'name' | 'code'> | null;
    chapter?: Pick<Chapter, 'id' | 'name'> | null;
    options?: QuestionOption[];
    materials?: MaterialAttachment[];
    created_at?: string | null;
}

export interface ExamQuestion {
    id: string;
    question_text: string;
    question_image?: string | null;
    marks: number;
    negative_marks: number;
    options: ExamOption[];
}

export interface ExamQuestionNode {
    question: ExamQuestion;
}

export interface ExamAttemptAnswer {
    question_id: string;
    selected_option_id: string | null;
}

export interface ExamAttemptDTO {
    id: string;
    end_time: string;
    answers?: ExamAttemptAnswer[];
}

export interface ExamDTO {
    id: string;
    title: string;
    negative_enabled: boolean;
    questions: ExamQuestionNode[];
}
