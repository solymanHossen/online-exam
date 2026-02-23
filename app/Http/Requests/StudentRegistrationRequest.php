<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StudentRegistrationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Use Policies in production
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // User rules
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'max:20'],

            // Student rules
            'roll_number' => ['required', 'string', 'max:50', 'unique:students,roll_number'],
            'guardian_name' => ['nullable', 'string', 'max:120'],
            'guardian_phone' => ['nullable', 'string', 'max:20'],
            'batch_id' => ['required', 'uuid', 'exists:batches,id'],
            'admission_date' => ['required', 'date'],
        ];
    }
}
