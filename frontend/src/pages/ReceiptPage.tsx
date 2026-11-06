import { useLocation } from 'react-router-dom';
import type { CheckoutResponseDto } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function ReceiptPage() {
  const location = useLocation();
  const receipt = (location.state as { receipt?: CheckoutResponseDto })?.receipt;

  if (!receipt) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Receipt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>No receipt data. Complete a checkout from POS.</div>
          <Button onClick={() => window.location.href = '/'}>Back to POS</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Receipt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <div>
            <span className="font-medium">Sale #:</span> {receipt.saleNumber}
          </div>
          <div>
            <span className="font-medium">Date:</span> {new Date(receipt.createdAtUtc).toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Payment:</span> {receipt.paymentMethod}
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipt.items.map((it, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <div className="font-medium">{it.productName}</div>
                  <div className="text-sm text-muted-foreground">{it.productSKU}</div>
                </TableCell>
                <TableCell className="text-right">{it.quantity}</TableCell>
                <TableCell className="text-right">₱{it.lineTotal.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="text-right text-lg font-semibold">Grand Total: ₱{receipt.grandTotal.toFixed(2)}</div>
        <Button onClick={() => window.location.href = '/'}>New Sale</Button>
      </CardContent>
    </Card>
  );
}
