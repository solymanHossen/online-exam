<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentRequest extends FormRequest
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
        $studentId = $this->route('student') ? $this->route('student')->id : null;

        return [
            'batch_id' => 'sometimes|required|exists:batches,id',
            'roll_number' => 'sometimes|required|string|max:50|unique:students,roll_number,' . $studentId,
            'admission_date' => 'sometimes|required|date',
            'status' => 'sometimes|required|string|in:active,inactive,graduated,suspended',
        ];
    }
}
