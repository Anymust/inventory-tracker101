import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, TrendingUp, DollarSign } from "lucide-react";
import { AddItemDialog } from "./AddItemDialog";
import { SalesDialog } from "./SalesDialog";
import { ItemsTable } from "./ItemsTable";

export interface InventoryItem {
  id: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  sold: number;
}

const InventoryDashboard = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showSales, setShowSales] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const addItem = (item: Omit<InventoryItem, "id" | "sold">) => {
    const newItem: InventoryItem = {
      ...item,
      id: crypto.randomUUID(),
      sold: 0,
    };
    setItems(prev => [...prev, newItem]);
  };

  const recordSale = (itemId: string, quantity: number) => {
    setItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, stock: item.stock - quantity, sold: item.sold + quantity }
          : item
      )
    );
  };

  const totalValue = items.reduce((sum, item) => sum + (item.sellPrice * item.stock), 0);
  const totalInvestment = items.reduce((sum, item) => sum + (item.buyPrice * (item.stock + item.sold)), 0);
  const totalRevenue = items.reduce((sum, item) => sum + (item.sellPrice * item.sold), 0);
  const breakEvenNeeded = Math.max(0, totalInvestment - totalRevenue);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inventory Manager</h1>
            <p className="text-muted-foreground">Track your business inventory and sales</p>
          </div>
          <Button onClick={() => setShowAddItem(true)} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{items.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">${totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Break Even Needed</CardTitle>
              <DollarSign className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">${breakEvenNeeded.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No items in your inventory yet. Add your first item to get started!
              </div>
            ) : (
              <ItemsTable 
                items={items} 
                onRecordSale={(item) => {
                  setSelectedItem(item);
                  setShowSales(true);
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <AddItemDialog 
        open={showAddItem} 
        onOpenChange={setShowAddItem}
        onAddItem={addItem}
      />

      <SalesDialog
        open={showSales}
        onOpenChange={setShowSales}
        item={selectedItem}
        onRecordSale={recordSale}
      />
    </div>
  );
};

export default InventoryDashboard;