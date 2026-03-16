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

    protected function prepareForValidation(): void
    {
        $payload = [];

        if ($this->has('options')) {
            $options = $this->input('options', []);

            if (is_array($options)) {
                foreach ($options as $key => $option) {
                    if (isset($option['option_text'])) {
                        $options[$key]['option_text'] = clean($option['option_text']);
                    }
                }
            }

            $payload['options'] = $options;
        }

        if ($this->has('question_text')) {
            $payload['question_text'] = clean($this->input('question_text'));
        }

        if ($this->has('explanation')) {
            $payload['explanation'] = clean($this->input('explanation'));
        }

        if ($payload !== []) {
            $this->merge($payload);
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
            'subject_id' => 'sometimes|required|uuid|exists:subjects,id',
            'chapter_id' => 'sometimes|required|uuid|exists:chapters,id',
            'question_text' => 'sometimes|required|string',
            'question_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'existing_question_image' => 'nullable|string',
            'explanation' => 'nullable|string',
            'difficulty' => 'sometimes|required|string|in:easy,medium,hard',
            'marks' => 'sometimes|required|numeric|min:0',
            'negative_marks' => 'sometimes|required|numeric|min:0',
            'is_active' => 'sometimes|boolean',
            'options' => 'sometimes|required|array|min:2',
            'options.*.option_text' => 'required_with:options|string',
            'options.*.option_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'options.*.existing_option_image' => 'nullable|string',
            'options.*.is_correct' => 'boolean',
        ];
    }
}
