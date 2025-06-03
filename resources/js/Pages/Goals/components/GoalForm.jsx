import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function GoalForm({ goal, mainCategories, subcategories, mode = 'create' }) {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    title: goal?.title || '',
    target_amount: goal?.target_amount || '',
    target_date: goal?.target_date || '',
    category_id: goal?.category_id || 'none',
    description: goal?.description || '',
  });

  useEffect(() => {
    if (goal) {
      reset({
        title: goal.title,
        target_amount: goal.target_amount,
        target_date: goal.target_date,
        category_id: goal.category_id,
        description: goal.description,
      });
    }
  }, [goal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a copy of data to modify before submission
    const formData = { ...data };
    
    // Convert "none" value to null for the backend
    if (formData.category_id === 'none') {
      formData.category_id = null;
    }
    
    if (mode === 'create') {
      post(route('goals.store'), formData);
    } else {
      put(route('goals.update', goal.id), formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              type="text"
              value={data.title}
              onChange={e => setData('title', e.target.value)}
            />
            {errors.title && (
              <Alert variant="destructive">
                <AlertDescription>{errors.title}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_amount">Target Amount</Label>
            <Input
              id="target_amount"
              type="number"
              step="0.01"
              min="0"
              value={data.target_amount}
              onChange={e => setData('target_amount', e.target.value)}
            />
            {errors.target_amount && (
              <Alert variant="destructive">
                <AlertDescription>{errors.target_amount}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_date">Target Date</Label>
            <Input
              id="target_date"
              type="date"
              value={data.target_date}
              onChange={e => setData('target_date', e.target.value)}
            />
            {errors.target_date && (
              <Alert variant="destructive">
                <AlertDescription>{errors.target_date}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={data.category_id}
              onValueChange={value => setData('category_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="none">No Category</SelectItem>
                
                {mainCategories && mainCategories.map(mainCategory => (
                  <SelectGroup key={mainCategory.id}>
                    <SelectLabel className="font-medium text-gray-700 dark:text-gray-300">
                      {mainCategory.name}
                    </SelectLabel>
                    
                    {subcategories && subcategories[mainCategory.id] ? (
                      subcategories[mainCategory.id].map(subcategory => (
                        <SelectItem 
                          key={subcategory.id} 
                          value={subcategory.id}
                          className="pl-6"
                        >
                          {subcategory.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem disabled className="text-gray-400 pl-6">
                        No subcategories
                      </SelectItem>
                    )}
                  </SelectGroup>
                ))}
                
                {/* Add an "Other" group for subcategories without a parent */}
                {subcategories && subcategories.null && (
                  <SelectGroup>
                    <SelectLabel className="font-medium text-gray-700 dark:text-gray-300">
                      Other
                    </SelectLabel>
                    {subcategories.null.map(subcategory => (
                      <SelectItem 
                        key={subcategory.id} 
                        value={subcategory.id}
                        className="pl-6"
                      >
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <Alert variant="destructive">
                <AlertDescription>{errors.category_id}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={e => setData('description', e.target.value)}
              rows={4}
            />
            {errors.description && (
              <Alert variant="destructive">
                <AlertDescription>{errors.description}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={processing}>
            {mode === 'create' ? 'Create Goal' : 'Update Goal'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}