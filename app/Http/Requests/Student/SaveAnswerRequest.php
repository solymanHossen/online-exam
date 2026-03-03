<?php

namespace App\Http\Requests\Student;

use App\Models\ExamAttempt;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveAnswerRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var ExamAttempt|null $attempt */
        $attempt = $this->route('attempt');

        return $attempt !== null && $this->user()?->can('update', $attempt) === true;
    }

    public function rules(): array
    {
        /** @var ExamAttempt|null $attempt */
        $attempt = $this->route('attempt');

        return [
            'question_id' => [
                'required',
                'uuid',
                Rule::exists('exam_questions', 'question_id')->where('exam_id', $attempt?->exam_id),
            ],
            'selected_option_id' => [
                'required',
                'uuid',
                Rule::exists('question_options', 'id')->where('question_id', $this->input('question_id')),
            ],
        ];
    }
}
 
