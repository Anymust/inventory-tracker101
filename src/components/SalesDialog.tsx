import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { InventoryItem } from "@/types/inventory";

interface SalesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  onRecordSale: (itemId: string, quantity: number) => void;
}

export const SalesDialog = ({ open, onOpenChange, item, onRecordSale }: SalesDialogProps) => {
  const [quantity, setQuantity] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item || !quantity) {
      toast({
        title: "Error",
        description: "Please enter a quantity",
        variant: "destructive",
      });
      return;
    }

    const quantityNum = parseInt(quantity);

    if (quantityNum <= 0) {
      toast({
        title: "Error",
        description: "Quantity must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (quantityNum > item.stock) {
      toast({
        title: "Error",
        description: "Not enough stock available",
        variant: "destructive",
      });
      return;
    }

    onRecordSale(item.id, quantityNum);
    
    const revenue = quantityNum * item.sellPrice;
    toast({
      title: "Sale Recorded",
      description: `Sold ${quantityNum} ${item.name} for $${revenue.toFixed(2)}`,
    });

    setQuantity("");
    onOpenChange(false);
  };

  const revenue = item && quantity ? parseInt(quantity) * item.sellPrice : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Sale</DialogTitle>
        </DialogHeader>
        {item && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Item</Label>
              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">
                  Available stock: {item.stock} units
                </div>
                <div className="text-sm text-muted-foreground">
                  Sell price: ${item.sellPrice.toFixed(2)} each
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Sold</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                max={item.stock}
              />
            </div>
            
            {quantity && (
              <div className="p-3 bg-success/10 border border-success/20 rounded-md">
                <div className="text-sm font-medium text-success">
                  Revenue: ${revenue.toFixed(2)}
                </div>
              </div>
            )}
            
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Record Sale
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};