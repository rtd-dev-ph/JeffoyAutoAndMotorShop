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
  const [productStatus, setProductStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [productRequest, setProductRequest] = useState(0);
  const [productId, setProductId] = useState<string>('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('Received shipment');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiClient.get<ProductDto[]>('/api/products')
      .then(data => {
        if (cancelled) return;
        setProducts(data.filter(product => product.isActive));
        setProductStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setProductStatus('error');
      });
    return () => { cancelled = true; };
  }, [productRequest]);

  const validProduct = productStatus === 'ready' && products.some(product => String(product.id) === productId);
  const productUnavailable = productStatus !== 'ready' || products.length === 0;
  const productPlaceholder = productStatus === 'loading' ? 'Loading products...'
    : productStatus === 'error' ? 'Products unavailable'
    : products.length === 0 ? 'No products available' : 'Select product';

  async function submit() {
    if (!validProduct || !quantity) {
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
          <Label htmlFor="restock-product">Product</Label>
          <Select
            id="restock-product"
            name="productId"
            disabled={productUnavailable || loading}
            items={products.map(p => ({ value: String(p.id), label: `${p.name} (${p.sku})` }))}
            value={validProduct ? productId : null}
            onValueChange={(v: string | null) => setProductId(v ?? '')}
          >
            <SelectTrigger id="restock-product" aria-describedby="product-status">
              <SelectValue placeholder={productPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name} ({p.sku})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div id="product-status" className="text-sm text-muted-foreground" aria-live="polite">
            {productStatus === 'error' && (
              <div role="alert" className="space-y-2 text-destructive">
                <p>Could not load products. Please try again.</p>
                <Button size="sm" variant="outline" onClick={() => { setProductStatus('loading'); setProductRequest(value => value + 1); }}>Retry</Button>
              </div>
            )}
            {productStatus === 'ready' && products.length === 0 && <p>Create a product first, then return to receive stock.</p>}
          </div>
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
          <Button onClick={submit} disabled={loading || productUnavailable}>
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
