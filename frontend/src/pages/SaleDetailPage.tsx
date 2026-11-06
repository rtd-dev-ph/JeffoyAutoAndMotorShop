import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '@/lib/apiClient';
import type { SaleDto, VoidSaleDto } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function SaleDetailPage() {
  const { id } = useParams();
  const [sale, setSale] = useState<SaleDto | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSale() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<SaleDto>(`/api/sales/${id}`);
      setSale(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sale');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSale();
  }, [id]);

  async function voidSale() {
    if (!id || !voidReason.trim()) {
      setError('Void reason required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const body: VoidSaleDto = { reason: voidReason };
      await apiClient.post(`/api/sales/${id}/void`, body);
      await loadSale();
      setVoidReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Void failed');
    } finally {
      setLoading(false);
    }
  }

  if (!sale) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sale Detail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-sm text-destructive">{error}</div>}
          {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
          <Button onClick={() => window.location.href = '/sales'}>Back</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Sale {sale.saleNumber}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <div>
            <span className="font-medium">Date:</span> {new Date(sale.createdAtUtc).toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Payment:</span> {sale.paymentMethod}
          </div>
          <div>
            <span className="font-medium">Status:</span> {sale.status}
          </div>
          <div>
            <span className="font-medium">Grand Total:</span> ₱{sale.grandTotal.toFixed(2)}
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Line Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sale.items.map((it, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <div className="font-medium">{it.productName}</div>
                  <div className="text-sm text-muted-foreground">{it.productSKU}</div>
                </TableCell>
                <TableCell className="text-right">{it.quantity}</TableCell>
                <TableCell className="text-right">₱{it.unitPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right">₱{it.lineTotal.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {sale.status === 'Completed' && (
          <div className="space-y-2">
            <Label>Void Reason</Label>
            <Input value={voidReason} onChange={(e) => setVoidReason(e.target.value)} placeholder="Enter reason" />
            <Button onClick={voidSale} disabled={loading || !voidReason.trim()} variant="destructive">
              {loading ? 'Processing...' : 'Void Sale'}
            </Button>
          </div>
        )}
        {error && <div className="text-sm text-destructive">{error}</div>}
        <Button onClick={() => window.location.href = '/sales'}>Back</Button>
      </CardContent>
    </Card>
  );
}
