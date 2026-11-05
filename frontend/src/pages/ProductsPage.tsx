import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/apiClient';
import type { ProductDto } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function ProductsPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<ProductDto[]>('/api/products');
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Products</CardTitle>
        <Button onClick={() => window.location.href = '/products/new'}>Create Product</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="text-sm text-destructive">{error}</div>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Low Stock</TableHead>
              <TableHead>Active</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.sku}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.categoryName || '-'}</TableCell>
                <TableCell className="text-right">₱{p.costPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right">₱{p.sellingPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right">{p.stockQuantity}</TableCell>
                <TableCell>{p.isLowStock ? 'Yes' : 'No'}</TableCell>
                <TableCell>{p.isActive ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = `/products/${p.id}`}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
      </CardContent>
    </Card>
  );
}
