import { useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import type { CheckoutDto, CheckoutItemDto, CheckoutResponseDto, ProductDto } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';

type CartItem = {
  productId: number;
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export function POSPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'GCash'>('Cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function searchProducts() {
    setLoading(true);
    setError(null);
    try {
      const all = await apiClient.get<ProductDto[]>('/api/products');
      const q = query.trim().toLowerCase();
      setProducts(
        q
          ? all.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
          : all,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search products');
    } finally {
      setLoading(false);
    }
  }

  function addToCart(p: ProductDto) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === p.id);
      if (existing) {
        return prev.map((i) => (i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { productId: p.id, sku: p.sku, name: p.name, unitPrice: p.sellingPrice, quantity: 1 }];
    });
  }

  function updateQty(productId: number, qty: number) {
    setCart((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, qty) } : i)));
  }

  function removeItem(productId: number) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  const grandTotal = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  async function checkout() {
    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const items: CheckoutItemDto[] = cart.map((i) => ({ productId: i.productId, quantity: i.quantity }));
      const body: CheckoutDto = { items, paymentMethod };
      const res = await apiClient.post<CheckoutResponseDto>('/api/sales/checkout', body);
      navigate('/receipt', { state: { receipt: res } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or SKU" />
            <Button onClick={searchProducts} disabled={loading}>
              Search
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.sku}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell className="text-right">₱{p.sellingPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => addToCart(p)}>
                      Add
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cart</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead className="text-right">Line Total</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {cart.map((i) => (
                <TableRow key={i.productId}>
                  <TableCell>
                    <div className="font-medium">{i.name}</div>
                    <div className="text-sm text-muted-foreground">{i.sku}</div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      className="w-20"
                      value={i.quantity}
                      onChange={(e) => updateQty(i.productId, Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell className="text-right">₱{(i.unitPrice * i.quantity).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => removeItem(i.productId)}>
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="text-right text-lg font-semibold">Grand Total: ₱{grandTotal.toFixed(2)}</div>
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={(v: string) => setPaymentMethod(v as 'Cash' | 'GCash')}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="GCash">GCash</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <Button onClick={checkout} disabled={loading || cart.length === 0}>
            {loading ? 'Processing...' : 'Checkout'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
