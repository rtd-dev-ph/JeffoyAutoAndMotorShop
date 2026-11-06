import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/apiClient";
import type { StockMovementDto } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function StockPage() {
  const [movements, setMovements] = useState<StockMovementDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMovements() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<StockMovementDto[]>(
        "/api/stockmovements/all",
      );
      setMovements(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load stock movements",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMovements();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Stock Movements</CardTitle>
        {/* <Link to="/stock/restock" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4">
          Restock
        </Link> */}
        <Link
          to="/stock/restock"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-4"
        >
          Restock
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="text-sm text-destructive">{error}</div>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Qty Change</TableHead>
              <TableHead className="text-right">Resulting Stock</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Reference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.productName}</TableCell>
                <TableCell>{m.productSKU}</TableCell>
                <TableCell>{m.movementType}</TableCell>
                <TableCell className="text-right">
                  {m.quantityChange > 0
                    ? `+${m.quantityChange}`
                    : m.quantityChange}
                </TableCell>
                <TableCell className="text-right">
                  {m.resultingStockQuantity}
                </TableCell>
                <TableCell>
                  {new Date(m.createdAtUtc).toLocaleString()}
                </TableCell>
                <TableCell>{m.reference || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {loading && (
          <div className="text-sm text-muted-foreground">Loading...</div>
        )}
      </CardContent>
    </Card>
  );
}
