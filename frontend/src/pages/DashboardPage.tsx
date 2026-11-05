import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import type { DailySalesReportDto, SaleDto } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function DashboardPage() {
  const [report, setReport] = useState<DailySalesReportDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.get<DailySalesReportDto>('/api/reports/daily-sales');
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-destructive">{error}</div>;
  if (!report) return <div>No data</div>;

  const recentSales: SaleDto[] = report.sales.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">{report.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.transactionCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.totalItemsSold}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{report.totalSales.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cash</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{report.cashTotal.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">GCash</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{report.gCashTotal.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="-mx-2 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale #</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No sales yet
                    </TableCell>
                  </TableRow>
                ) : (
                  recentSales.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.saleNumber}</TableCell>
                      <TableCell className="text-right font-medium">₱{s.grandTotal.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          s.paymentMethod === 'Cash'
                            ? 'border-cash/50 text-cash bg-cash/5'
                            : 'border-gcash/50 text-gcash bg-gcash/5'
                        }`}>
                          {s.paymentMethod === 'Cash' ? '💵 Cash' : '📱 GCash'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          s.status === 'Completed'
                            ? 'border-green/50 text-green bg-green/5'
                            : 'border-orange/50 text-orange bg-orange/5'
                        }`}>
                          {s.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {new Date(s.createdAtUtc).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
