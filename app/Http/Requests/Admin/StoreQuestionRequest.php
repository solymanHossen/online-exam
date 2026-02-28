<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreQuestionRequest extends FormRequest
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
        $options = $this->input('options', []);

        if (is_array($options)) {
            foreach ($options as $key => $option) {
                if (isset($option['option_text'])) {
                    $options[$key]['option_text'] = clean($option['option_text']);
                }
            }
        }

        $this->merge([
            'question_text' => $this->has('question_text') ? clean($this->input('question_text')) : null,
            'explanation' => $this->has('explanation') ? clean($this->input('explanation')) : null,
            'options' => $options,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'subject_id' => 'required|uuid|exists:subjects,id',
            'chapter_id' => 'required|uuid|exists:chapters,id',
            'question_text' => 'required|string',
            'question_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'explanation' => 'nullable|string',
            'difficulty' => 'required|string|in:easy,medium,hard',
            'marks' => 'required|numeric|min:0',
            'negative_marks' => 'required|numeric|min:0',

            // Options validation
            'options' => 'required|array|min:2',
            'options.*.option_text' => 'required|string',
            'options.*.option_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'options.*.is_correct' => 'boolean',
        ];
    }
}
