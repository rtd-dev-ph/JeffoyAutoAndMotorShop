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

  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);
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
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-foreground">Point of Sale</h2>
          <p className="text-sm text-muted-foreground">Scan items, collect payment, and print receipt.</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-foreground">₱{grandTotal.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">{itemCount} item{itemCount !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <div className="flex items-center gap-2">
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or SKU" />
                <Button onClick={searchProducts} disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No products found
                      </TableCell>
                    </TableRow>
                  )}
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.sku}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell className="text-right">₱{p.sellingPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button size="sm" className="w-full" onClick={() => addToCart(p)}>
                          Add to cart
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Cart</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1 max-h-[50vh] overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-4">Cart is empty</div>
                ) : (
                  cart.map((i) => (
                    <div key={i.productId} className="flex items-center gap-3 p-2 rounded-lg border bg-background">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{i.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{i.sku}</div>
                        <div className="text-xs text-muted-foreground">₱{i.unitPrice.toFixed(2)} each</div>
                      </div>
                      <Input
                        type="number"
                        className="w-16"
                        value={i.quantity}
                        onChange={(e) => updateQty(i.productId, Number(e.target.value))}
                      />
                      <Button variant="outline" size="icon" onClick={() => removeItem(i.productId)}>
                        ×
                      </Button>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₱{grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span>Total</span>
                  <span className="text-primary">₱{grandTotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-method" className="text-sm">Payment Method</Label>
                <Select
                  id="payment-method"
                  name="paymentMethod"
                  items={{ Cash: 'Cash', GCash: 'GCash' }}
                  value={paymentMethod}
                  onValueChange={(v: string | null) => setPaymentMethod((v ?? 'Cash') as 'Cash' | 'GCash')}
                >
                  <SelectTrigger id="payment-method" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="GCash">GCash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <div className="text-sm text-destructive">{error}</div>}
              <Button
                onClick={checkout}
                disabled={loading || cart.length === 0}
                className="w-full"
              >
                {loading ? 'Processing...' : 'Checkout'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
