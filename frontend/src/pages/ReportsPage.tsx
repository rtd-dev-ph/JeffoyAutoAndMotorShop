import { useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import type { DailySalesReportDto, SaleDto } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function ReportsPage() {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<DailySalesReportDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<DailySalesReportDto>(`/api/reports/daily-sales?date=${date}`);
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    if (!report) return;
    const headers = ['Sale #', 'Date', 'Payment Method', 'Status', 'Items', 'Total'];
    const rows = report.sales.map((s) => [
      s.saleNumber,
      new Date(s.createdAtUtc).toLocaleString(),
      s.paymentMethod,
      s.status,
      s.items?.reduce((sum, i) => sum + i.quantity, 0).toString() || '0',
      s.grandTotal.toFixed(2),
    ]);
    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales-report-${report.date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportJSON() {
    if (!report) return;
    const dataStr = JSON.stringify(report, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales-report-${report.date}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function printReport() {
    if (!report) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Sales Report - ${report.date}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; font-size: 24px; }
            h2 { color: #666; font-size: 18px; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0; }
            .summary-card { border: 1px solid #ddd; padding: 10px; text-align: center; }
            .summary-card .label { color: #666; font-size: 12px; }
            .summary-card .value { font-size: 18px; font-weight: bold; margin-top: 5px; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h1>Jeffoy Auto and Motor Shop - Sales Report</h1>
          <p><strong>Date:</strong> ${report.date}</p>
          
          <div class="summary">
            <div class="summary-card">
              <div class="label">Transactions</div>
              <div class="value">${report.transactionCount}</div>
            </div>
            <div class="summary-card">
              <div class="label">Items Sold</div>
              <div class="value">${report.totalItemsSold}</div>
            </div>
            <div class="summary-card">
              <div class="label">Total Sales</div>
              <div class="value">₱${report.totalSales.toFixed(2)}</div>
            </div>
            <div class="summary-card">
              <div class="label">Cash / GCash</div>
              <div class="value">₱${report.cashTotal.toFixed(2)} / ₱${report.gCashTotal.toFixed(2)}</div>
            </div>
          </div>
          
          <h2>Sales Transactions</h2>
          <table>
            <thead>
              <tr>
                <th>Sale #</th>
                <th>Time</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Items</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${report.sales
                .map(
                  (s) => `
                <tr>
                  <td>${s.saleNumber}</td>
                  <td>${new Date(s.createdAtUtc).toLocaleTimeString()}</td>
                  <td>${s.paymentMethod}</td>
                  <td>${s.status}</td>
                  <td>${s.items?.reduce((sum, i) => sum + i.quantity, 0) || 0}</td>
                  <td style="text-align: right;">₱${s.grandTotal.toFixed(2)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          
          <p style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
            Generated on ${new Date().toLocaleString()}
          </p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Sales Reports</h2>
          <p className="text-sm text-muted-foreground">View, export, preview and print sales reports</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Generate Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 max-w-xs space-y-2">
              <Label>Select Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <Button onClick={loadReport} disabled={loading}>
              {loading ? 'Loading...' : 'Load Report'}
            </Button>
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
        </CardContent>
      </Card>

      {report && (
        <>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowPreview(!showPreview)} variant="outline">
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            <Button onClick={exportCSV} variant="outline">
              Export CSV
            </Button>
            <Button onClick={exportJSON} variant="outline">
              Export JSON
            </Button>
            <Button onClick={printReport}>
              Print Report
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">{report.transactionCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Items Sold</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">{report.totalItemsSold}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">₱{report.totalSales.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Cash / GCash</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm sm:text-lg font-bold">₱{report.cashTotal.toFixed(2)} / ₱{report.gCashTotal.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Sales Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="-mx-2 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sale #</TableHead>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.sales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                          No sales found for this date
                        </TableCell>
                      </TableRow>
                    ) : (
                      report.sales.map((s: SaleDto) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.saleNumber}</TableCell>
                          <TableCell className="text-sm">{new Date(s.createdAtUtc).toLocaleString()}</TableCell>
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
                          <TableCell className="text-right">{s.items?.reduce((sum, i) => sum + i.quantity, 0) || 0}</TableCell>
                          <TableCell className="text-right font-medium">₱{s.grandTotal.toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Print Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-white text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
                  <div className="text-center mb-6">
                    <h1 className="text-xl font-bold">Jeffoy Auto and Motor Shop</h1>
                    <p className="text-sm">Sales Report</p>
                    <p className="text-sm">Date: {report.date}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="text-center border p-2">
                      <div className="text-xs text-gray-600">Transactions</div>
                      <div className="font-bold">{report.transactionCount}</div>
                    </div>
                    <div className="text-center border p-2">
                      <div className="text-xs text-gray-600">Items Sold</div>
                      <div className="font-bold">{report.totalItemsSold}</div>
                    </div>
                    <div className="text-center border p-2">
                      <div className="text-xs text-gray-600">Total Sales</div>
                      <div className="font-bold">₱{report.totalSales.toFixed(2)}</div>
                    </div>
                    <div className="text-center border p-2">
                      <div className="text-xs text-gray-600">Cash / GCash</div>
                      <div className="font-bold text-xs">₱{report.cashTotal.toFixed(2)} / ₱{report.gCashTotal.toFixed(2)}</div>
                    </div>
                  </div>
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Sale #</th>
                        <th className="border p-2 text-left">Time</th>
                        <th className="border p-2 text-left">Payment</th>
                        <th className="border p-2 text-left">Status</th>
                        <th className="border p-2 text-right">Items</th>
                        <th className="border p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.sales.map((s) => (
                        <tr key={s.id}>
                          <td className="border p-2">{s.saleNumber}</td>
                          <td className="border p-2">{new Date(s.createdAtUtc).toLocaleTimeString()}</td>
                          <td className="border p-2">{s.paymentMethod}</td>
                          <td className="border p-2">{s.status}</td>
                          <td className="border p-2 text-right">{s.items?.reduce((sum, i) => sum + i.quantity, 0) || 0}</td>
                          <td className="border p-2 text-right">₱{s.grandTotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 text-xs text-gray-600 text-center">
                    Generated on {new Date().toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
