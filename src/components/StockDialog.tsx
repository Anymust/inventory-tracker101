import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { InventoryItem } from "@/types/inventory";

interface StockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  onUpdateStock: (itemId: string, quantity: number) => void;
}

export const StockDialog = ({ open, onOpenChange, item, onUpdateStock }: StockDialogProps) => {
  const [quantity, setQuantity] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    const quantityNum = parseInt(quantity);
    if (quantityNum <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid quantity greater than 0",
        variant: "destructive",
      });
      return;
    }

    onUpdateStock(item.id, quantityNum);
    toast({
      title: "Stock updated",
      description: `Added ${quantityNum} units to ${item.name}`,
    });
    setQuantity("");
    onOpenChange(false);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Stock - {item.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Current stock: <span className="font-medium">{item.stock}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Buy price: <span className="font-medium">${item.buyPrice.toFixed(2)}</span>
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="quantity">Quantity to Add</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity to add"
                required
              />
            </div>
            {quantity && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm font-medium">
                  Total cost: ${(parseFloat(quantity) * item.buyPrice).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  New stock level: {item.stock + parseInt(quantity || "0")}
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Stock</Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};