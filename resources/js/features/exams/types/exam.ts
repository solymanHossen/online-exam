export interface ExamOption {
    id: string;
    option_text: string;
    option_image?: string | null;
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
