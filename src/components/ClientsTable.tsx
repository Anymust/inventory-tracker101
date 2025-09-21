import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2 } from "lucide-react";
import { Client } from "./ClientsSection";

interface ClientsTableProps {
  clients: Client[];
  getClientBalance: (clientId: string) => number;
  onAddMoney: (client: Client) => void;
  onDeductMoney: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
}

export const ClientsTable = ({ 
  clients, 
  getClientBalance, 
  onAddMoney, 
  onDeductMoney, 
  onDeleteClient 
}: ClientsTableProps) => {
  if (clients.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No clients added yet. Click "Add Client" to get started.
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="text-right">Tab Balance</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => {
            const balance = getClientBalance(client.id);
            return (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {client.email && <div>{client.email}</div>}
                    {client.phone && <div>{client.phone}</div>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className={balance >= 0 ? "text-green-600" : "text-red-600"}>
                    ${Math.abs(balance).toFixed(2)}
                  </span>
                  {balance < 0 && (
                    <span className="text-xs text-muted-foreground ml-1">(owes)</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddMoney(client)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeductMoney(client)}
                    >
                      <Minus className="h-3 w-3 mr-1" />
                      Deduct
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteClient(client.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};