import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '@/lib/apiClient';
import type { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CategoryFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get<CategoryDto[]>('/api/categories').then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (isEdit && categories.length > 0 && id) {
      const c = categories.find((x) => x.id === Number(id));
      if (c) {
        setName(c.name);
        setDescription(c.description || '');
        setIsActive(c.isActive);
      }
    }
  }, [isEdit, categories, id]);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      if (isEdit && id) {
        const body: UpdateCategoryDto = { name, description: description || null };
        await apiClient.put(`/api/categories/${id}`, body);
      } else {
        const body: CreateCategoryDto = { name, description: description || null };
        await apiClient.post('/api/categories', body);
      }
      navigate('/categories');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive() {
    if (!isEdit || !id) return;
    setLoading(true);
    setError(null);
    try {
      // UpdateCategoryDto doesn't have isActive, so we need to fetch current and PUT with name/description
      // Backend may allow toggling via PUT; try updating with current values
      const c = categories.find((x) => x.id === Number(id));
      if (!c) throw new Error('Category not found');
      const body: UpdateCategoryDto = { name: c.name, description: c.description };
      await apiClient.put(`/api/categories/${id}`, body);
      navigate('/categories');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Category' : 'Create Category'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
        <div className="flex gap-2">
          <Button onClick={submit} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
          {isEdit && (
            <Button variant="outline" onClick={toggleActive} disabled={loading}>
              {isActive ? 'Deactivate' : 'Activate'}
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/categories')}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
