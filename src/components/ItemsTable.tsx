import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, Plus } from "lucide-react";
import { InventoryItem } from "@/types/inventory";

interface ItemsTableProps {
  items: InventoryItem[];
  onRecordSale: (item: InventoryItem) => void;
  onAddStock: (item: InventoryItem) => void;
}

export const ItemsTable = ({ items, onRecordSale, onAddStock }: ItemsTableProps) => {
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (stock < 10) return { label: "Low Stock", variant: "warning" as const };
    return { label: "In Stock", variant: "success" as const };
  };

  const calculateProfit = (item: InventoryItem) => {
    return (item.sellPrice - item.buyPrice) * item.sold;
  };

  const calculateBreakEven = (item: InventoryItem) => {
    const totalCost = item.buyPrice * (item.stock + item.sold);
    const currentRevenue = item.sellPrice * item.sold;
    const remaining = totalCost - currentRevenue;
    const unitsNeeded = remaining / (item.sellPrice - item.buyPrice);
    return Math.max(0, unitsNeeded);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item Name</TableHead>
          <TableHead>Buy Price</TableHead>
          <TableHead>Sell Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Sold</TableHead>
          <TableHead>Profit</TableHead>
          <TableHead>Break Even</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const stockStatus = getStockStatus(item.stock);
          const profit = calculateProfit(item);
          const breakEven = calculateBreakEven(item);
          
          return (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>${item.buyPrice.toFixed(2)}</TableCell>
              <TableCell>${item.sellPrice.toFixed(2)}</TableCell>
              <TableCell>{item.stock}</TableCell>
              <TableCell>{item.sold}</TableCell>
              <TableCell className={profit >= 0 ? "text-success" : "text-destructive"}>
                ${profit.toFixed(2)}
              </TableCell>
              <TableCell className="text-warning">
                {breakEven === 0 ? "✓ Break Even" : `${breakEven.toFixed(1)} more`}
              </TableCell>
              <TableCell>
                <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAddStock(item)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onRecordSale(item)}
                    disabled={item.stock === 0}
                  >
                    <ShoppingCart className="mr-1 h-3 w-3" />
                    Sell
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};