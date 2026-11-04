import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/apiClient';
import type { ProductDto } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function RestockPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [productId, setProductId] = useState<string>('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('Received shipment');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get<ProductDto[]>('/api/products').then(setProducts).catch(() => setProducts([]));
  }, []);

  async function submit() {
    if (!productId || !quantity) {
      setError('Product and quantity required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiClient.post(`/api/stock/${productId}/reorder`, { quantity: Number(quantity), reason });
      navigate('/stock');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Restock failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Restock Product</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Product</Label>
          <Select value={productId} onValueChange={(v: string | null) => setProductId(v || '')}>
            <SelectTrigger>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name} ({p.sku})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Quantity</Label>
          <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Reason</Label>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
        <div className="flex gap-2">
          <Button onClick={submit} disabled={loading}>
            {loading ? 'Processing...' : 'Restock'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/stock')}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
