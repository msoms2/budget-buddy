<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSavingsCategoryRequest;
use App\Http\Requests\UpdateSavingsCategoryRequest;
use App\Models\SavingsCategory;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SavingsCategoryController extends Controller
{
    /**
     * Display a listing of the savings categories.
     */
    public function index(Request $request)
    {
        $query = SavingsCategory::query()->forUser(auth()->id());

        // Filter by parent_id if provided
        if ($request->has('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        }

        // Include system categories if requested
        if (!$request->boolean('include_system', true)) {
            $query->where('is_system', false);
        }

        $categories = $query->get();

        return response()->json([
            'data' => $categories,
            'meta' => [
                'total' => $categories->count(),
                'has_system_categories' => $categories->contains('is_system', true)
            ]
        ]);
    }

    /**
     * Store a newly created savings category.
     */
    public function store(StoreSavingsCategoryRequest $request)
    {
        $category = SavingsCategory::create($request->validated());

        return response()->json([
            'message' => 'Category created successfully',
            'data' => $category
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified savings category.
     */
    public function show(SavingsCategory $category)
    {
        $this->authorize('view', $category);

        return response()->json([
            'data' => $category->load(['parent', 'children', 'savings']),
            'meta' => [
                'total_savings' => $category->total_savings,
                'savings_count' => $category->savings()->count(),
                'has_children' => $category->children()->exists()
            ]
        ]);
    }

    /**
     * Update the specified savings category.
     */
    public function update(UpdateSavingsCategoryRequest $request, SavingsCategory $category)
    {
        $this->authorize('update', $category);

        if ($category->is_system) {
            return response()->json([
                'message' => 'System categories cannot be modified'
            ], Response::HTTP_FORBIDDEN);
        }

        $category->update($request->validated());

        return response()->json([
            'message' => 'Category updated successfully',
            'data' => $category->fresh(['parent', 'children'])
        ]);
    }

    /**
     * Remove the specified savings category.
     */
    public function destroy(Request $request, SavingsCategory $category)
    {
        $this->authorize('delete', $category);

        if ($category->is_system) {
            return response()->json([
                'message' => 'System categories cannot be deleted'
            ], Response::HTTP_FORBIDDEN);
        }

        // If move_to parameter is provided, move savings to that category
        if ($request->has('move_to')) {
            $newCategory = SavingsCategory::findOrFail($request->move_to);
            $this->authorize('update', $newCategory);
            $category->moveSavingsTo($newCategory);
        } else if ($category->savings()->exists()) {
            return response()->json([
                'message' => 'Cannot delete category with savings. Provide move_to parameter to move savings.'
            ], Response::HTTP_CONFLICT);
        }

        // Check for child categories
        if ($category->children()->exists()) {
            return response()->json([
                'message' => 'Cannot delete category with subcategories'
            ], Response::HTTP_CONFLICT);
        }

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully'
        ]);
    }
}
