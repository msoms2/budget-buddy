<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin') || $this->user()->role === 'admin';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->route('user') ? $this->route('user')->id : null;
        
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required', 
                'string', 
                'email', 
                'max:255',
                Rule::unique('users')->ignore($userId)
            ],
            'username' => [
                'nullable',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('users')->ignore($userId)
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'currency_id' => ['nullable', 'exists:currencies,id'],
            'country_id' => ['nullable', 'exists:countries,id'],
            'role_ids' => ['nullable', 'array'],
            'role_ids.*' => ['exists:roles,id'],
            'status' => ['nullable', 'string', 'in:active,suspended,inactive'],
            'email_verified_at' => ['nullable', 'date'],
        ];

        // Password is required for new users, optional for updates
        if ($this->isMethod('POST')) {
            $rules['password'] = ['required', 'string', 'min:8', 'confirmed'];
        } else {
            $rules['password'] = ['nullable', 'string', 'min:8', 'confirmed'];
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The name field is required.',
            'email.required' => 'The email field is required.',
            'email.unique' => 'This email address is already taken.',
            'username.unique' => 'This username is already taken.',
            'username.alpha_dash' => 'The username may only contain letters, numbers, dashes and underscores.',
            'password.required' => 'The password field is required for new users.',
            'password.min' => 'The password must be at least 8 characters.',
            'password.confirmed' => 'The password confirmation does not match.',
            'date_of_birth.before' => 'The date of birth must be before today.',
            'currency_id.exists' => 'The selected currency is invalid.',
            'country_id.exists' => 'The selected country is invalid.',
            'role_ids.*.exists' => 'One or more selected roles are invalid.',
            'status.in' => 'The status must be active, suspended, or inactive.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure role_ids is always an array
        if ($this->has('role_ids') && !is_array($this->role_ids)) {
            $this->merge([
                'role_ids' => [$this->role_ids]
            ]);
        }

        // Convert empty strings to null for nullable fields
        $nullableFields = ['username', 'phone', 'bio', 'date_of_birth', 'currency_id', 'country_id'];
        foreach ($nullableFields as $field) {
            if ($this->has($field) && $this->input($field) === '') {
                $this->merge([$field => null]);
            }
        }
    }
}