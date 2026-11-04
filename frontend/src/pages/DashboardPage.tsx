import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import type { DailySalesReportDto } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard - {report.date}</h2>
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
    </div>
  );
}
