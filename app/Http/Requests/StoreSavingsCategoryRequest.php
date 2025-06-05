<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSavingsCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization will be handled by policy
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'user_id' => ['required', 'exists:users,id'],
            'icon' => ['required', 'string', 'max:50'],
            'icon_color' => ['required', 'string', 'max:50'],
            'bg_color' => ['required', 'string', 'max:50'],
            'is_system' => ['boolean'],
            'parent_id' => [
                'nullable',
                'exists:savings_categories,id',
                Rule::when($this->parent_id, function ($rule) {
                    return $rule->where(function ($query) {
                        $query->where('user_id', auth()->id())
                              ->orWhere('is_system', true);
                    });
                }),
            ],
        ];
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'user_id' => auth()->id(),
            'is_system' => false, // User-created categories are never system categories
        ]);
    }
}
