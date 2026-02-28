<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExamRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('description')) {
            $this->merge([
                'description' => clean($this->input('description')),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'batch_id' => 'sometimes|required|exists:batches,id',
            'total_marks' => 'sometimes|required|integer|min:0',
            'duration_minutes' => 'sometimes|required|integer|min:1',
            'pass_marks' => 'sometimes|required|integer|min:0|lte:total_marks',
            'status' => 'sometimes|required|string|in:draft,published,archived',
            'start_time' => 'sometimes|required|date',
            // Fix: require start_time if end_time is present, otherwise 'after:start_time' will fail on partial PUT/PATCH requests
            'end_time' => 'sometimes|required_with:start_time|date|after:start_time',
        ];
    }
}
