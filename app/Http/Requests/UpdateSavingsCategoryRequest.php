<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSavingsCategoryRequest extends FormRequest
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
            'parent_id' => [
                'nullable',
                'exists:savings_categories,id',
                Rule::when($this->parent_id, function ($rule) {
                    return $rule->where(function ($query) {
                        $query->where('user_id', auth()->id())
                              ->orWhere('is_system', true);
                    })->whereNot('id', $this->route('category')); // Prevent self-referencing
                }),
                function ($attribute, $value, $fail) {
                    // Prevent circular references
                    if ($value) {
                        $category = $this->route('category');
                        $descendants = $category->descendants()->pluck('id');
                        if ($descendants->contains($value)) {
                            $fail('Cannot set a descendant category as parent.');
                        }
                    }
                },
            ],
            'icon' => ['nullable', 'string', 'max:50'],
            'icon_color' => ['nullable', 'string', 'max:50'],
            'bg_color' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'parent_id.not_in' => 'A category cannot be its own parent.',
            'parent_id.exists' => 'The selected parent category does not exist.',
        ];
    }
}
