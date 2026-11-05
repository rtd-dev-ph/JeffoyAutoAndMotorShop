import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import type { DailySalesReportDto, SaleDto } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DashboardPage() {
  const [report, setReport] = useState<DailySalesReportDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.get<DailySalesReportDto>(
          "/api/reports/daily-sales",
        );
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load report");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-destructive">{error}</div>;
  if (!report) return <div>No data</div>;

  const empty = report.transactionCount === 0 && report.totalItemsSold === 0;
  const recentSales: SaleDto[] = report.sales.slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
            Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">{report.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg sm:text-2xl font-bold ${empty ? "text-muted-foreground" : ""}`}>
              {report.transactionCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Items Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg sm:text-2xl font-bold ${empty ? "text-muted-foreground" : ""}`}>
              {report.totalItemsSold}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg sm:text-2xl font-bold ${empty ? "text-muted-foreground" : ""}`}>
              ₱{report.totalSales.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Cash
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg sm:text-2xl font-bold ${empty ? "text-muted-foreground" : ""}`}>
              ₱{report.cashTotal.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              GCash
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg sm:text-2xl font-bold ${empty ? "text-muted-foreground" : ""}`}>
              ₱{report.gCashTotal.toFixed(2)}
            </div>
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
                  <TableHead className="text-right hidden sm:table-cell">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empty || recentSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-2xl mb-2">📊</div>
                        <p className="text-sm text-muted-foreground mb-1">No sales yet</p>
                        <p className="text-xs text-muted-foreground">Make a sale in POS to populate this report</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  recentSales.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.saleNumber}</TableCell>
                      <TableCell className="text-right font-medium">₱{s.grandTotal.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s.paymentMethod === "Cash" ? "border-cash/50 text-cash bg-cash/5" : "border-gcash/50 text-gcash bg-gcash/5"}`}>
                          {s.paymentMethod === "Cash" ? "💵 Cash" : "📱 GCash"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s.status === "Completed" ? "border-green/50 text-green bg-green/5" : "border-orange/50 text-orange bg-orange/5"}`}>
                          {s.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground hidden sm:table-cell">
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
