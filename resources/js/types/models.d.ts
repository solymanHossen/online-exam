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

export interface RolePermission {
    key: string;
    label: string;
}

export interface RolePermissionGroup {
    group: string;
    permissions: RolePermission[];
}

export interface RoleListItem {
    id: string;
    name: string;
    users_count?: number;
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

export interface AnalyticsLeaderboardEntry {
    rank: number;
    user_id: string;
    student_name: string;
    avatar?: string | null;
    batch_id?: string | null;
    batch_name?: string | null;
    exams_count: number;
    total_score: number;
    average_score: number;
    best_score: number;
}

export interface SubjectPerformanceMetric {
    subject_id: string;
    subject_name: string;
    proficiency_level: number;
    attempted: number;
    correct: number;
    correct_rate: number;
}

export interface QuestionInsight {
    id: string;
    question_id: string;
    question_text: string;
    times_attempted: number;
    times_correct: number;
    accuracy: number;
    subject_name?: string | null;
    chapter_name?: string | null;
}

export interface PersonalAnalyticsSummary {
    completed_exams: number;
    average_score: number;
    best_score: number;
    batch_name?: string | null;
    subjects_mastered: number;
    global_rank: number | null;
    batch_rank: number | null;
}

export type ExamStatus = 'draft' | 'published' | 'completed' | 'cancelled';

export interface StudentListItem {
    id: string;
    roll_number: string;
    status: string;
    batch_id: string;
    user?: {
        id?: string;
        name?: string;
        email?: string;
        avatar?: string | null;
        is_active?: boolean;
    } | null;
    batch?: {
        id: string;
        name: string;
    } | null;
    batches?: Array<{
        id: string;
        name: string;
    }>;
    guardian_name?: string | null;
    guardian_phone?: string | null;
    admission_date?: string | null;
    total_exams_taken?: number;
    average_score?: number;
}

export interface ExamBuilderQuestion {
    id: string;
    question_text: string;
    difficulty: QuestionDifficulty;
    marks: number;
    negative_marks: number;
    question_image?: string | null;
    subject?: Pick<Subject, 'id' | 'name' | 'code'> | null;
    chapter?: Pick<Chapter, 'id' | 'name' | 'subject_id'> | null;
}

export interface ExamBuilderExam {
    id: string;
    title: string;
    description?: string | null;
    batch_id?: string | null;
    price?: number | null;
    total_marks: number;
    duration_minutes: number;
    pass_marks: number;
    negative_enabled: boolean;
    shuffle_questions?: boolean;
    shuffle_options?: boolean;
    show_result_immediately?: boolean;
    start_time: string;
    end_time: string;
    status: ExamStatus;
    question_ids?: string[];
    selected_students?: string[];
}
