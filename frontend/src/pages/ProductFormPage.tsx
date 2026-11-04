import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '@/lib/apiClient';
import type { CategoryDto, CreateProductDto, ProductDto, UpdateProductDto } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [openingStock, setOpeningStock] = useState('0');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [openingStockReason, setOpeningStockReason] = useState('Initial stock');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get<CategoryDto[]>('/api/categories').then(setCategories).catch(() => setCategories([]));
    apiClient.get<ProductDto[]>('/api/products').then(setProducts).catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    if (isEdit && products.length > 0 && id) {
      const p = products.find((x) => x.id === Number(id));
      if (p) {
        setSku(p.sku);
        setName(p.name);
        setDescription(p.description || '');
        setCategoryId(String(p.categoryId));
        setCostPrice(String(p.costPrice));
        setSellingPrice(String(p.sellingPrice));
        setLowStockThreshold(String(p.lowStockThreshold));
        setIsActive(p.isActive);
      }
    }
  }, [isEdit, products, id]);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      if (isEdit && id) {
        const body: UpdateProductDto = {
          sku,
          name,
          description: description || null,
          categoryId: Number(categoryId),
          costPrice: Number(costPrice),
          sellingPrice: Number(sellingPrice),
          lowStockThreshold: Number(lowStockThreshold),
          isActive,
        };
        await apiClient.put(`/api/products/${id}`, body);
      } else {
        const body: CreateProductDto = {
          sku,
          name,
          description: description || null,
          categoryId: Number(categoryId),
          costPrice: Number(costPrice),
          sellingPrice: Number(sellingPrice),
          openingStock: Number(openingStock),
          lowStockThreshold: Number(lowStockThreshold),
          openingStockReason: openingStockReason || null,
        };
        await apiClient.post('/api/products', body);
      }
      navigate('/products');
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
      const p = products.find((x) => x.id === Number(id));
      if (!p) throw new Error('Product not found');
      const body: UpdateProductDto = {
        sku: p.sku,
        name: p.name,
        description: p.description,
        categoryId: p.categoryId,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        lowStockThreshold: p.lowStockThreshold,
        isActive: !p.isActive,
      };
      await apiClient.put(`/api/products/${id}`, body);
      navigate('/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Product' : 'Create Product'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>SKU</Label>
            <Input value={sku} onChange={(e) => setSku(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={(v: string | null) => setCategoryId(v || '')}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Low Stock Threshold</Label>
            <Input type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Cost Price</Label>
            <Input type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Selling Price</Label>
            <Input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
          </div>
          {!isEdit && (
            <>
              <div className="space-y-2">
                <Label>Opening Stock</Label>
                <Input type="number" value={openingStock} onChange={(e) => setOpeningStock(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Opening Stock Reason</Label>
                <Input value={openingStockReason} onChange={(e) => setOpeningStockReason(e.target.value)} />
              </div>
            </>
          )}
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
          <Button variant="outline" onClick={() => navigate('/products')}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
