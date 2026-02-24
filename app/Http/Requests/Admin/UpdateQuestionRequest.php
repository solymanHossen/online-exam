<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuestionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'question_text' => 'sometimes|required|string',
            'difficulty' => 'sometimes|required|string|in:easy,medium,hard',
            'marks' => 'sometimes|required|numeric|min:0',
            'negative_marks' => 'sometimes|required|numeric|min:0',
            'is_active' => 'sometimes|boolean',
        ];
    }
}
