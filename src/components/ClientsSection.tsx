import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, Minus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  client_id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  created_at: string;
}

export const ClientsSection = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [transactionDialog, setTransactionDialog] = useState<{
    open: boolean;
    client?: Client;
    type?: 'credit' | 'debit';
  }>({ open: false });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
    fetchTransactions();
  }, []);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Error fetching clients",
        description: error.message,
      });
      return;
    }
    
    setClients(data || []);
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Error fetching transactions",
        description: error.message,
      });
      return;
    }
    
    setTransactions((data as Transaction[]) || []);
  };

  const getClientBalance = (clientId: string): number => {
    return transactions
      .filter(t => t.client_id === clientId)
      .reduce((balance, transaction) => {
        return transaction.type === 'credit' 
          ? balance + transaction.amount 
          : balance - transaction.amount;
      }, 0);
  };

  const addClient = async (clientData: { name: string; email?: string; phone?: string }) => {
    const { error } = await supabase
      .from('clients')
      .insert([clientData]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error adding client",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Client added successfully",
      description: `${clientData.name} has been added to your clients list.`,
    });

    fetchClients();
  };

  const deleteClient = async (clientId: string) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error deleting client",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Client deleted",
      description: "Client has been removed from your list.",
    });

    fetchClients();
    fetchTransactions();
  };

  const addTransaction = async (
    clientId: string,
    type: 'credit' | 'debit',
    amount: number,
    description: string
  ) => {
    const { error } = await supabase
      .from('transactions')
      .insert([{
        client_id: clientId,
        type,
        amount,
        description
      }]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error adding transaction",
        description: error.message,
      });
      return;
    }

    const actionText = type === 'credit' ? 'added to' : 'deducted from';
    toast({
      title: "Transaction recorded",
      description: `$${amount} ${actionText} client's tab.`,
    });

    fetchTransactions();
  };

  const totalOwed = clients.reduce((total, client) => {
    return total + getClientBalance(client.id);
  }, 0);

  const ClientsTable = () => {
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
                        onClick={() => setTransactionDialog({ open: true, client, type: 'credit' })}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTransactionDialog({ open: true, client, type: 'debit' })}
                      >
                        <Minus className="h-3 w-3 mr-1" />
                        Deduct
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteClient(client.id)}
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

  const AddClientDialog = () => {
    const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name.trim()) {
        toast({
          variant: "destructive",
          title: "Name required",
          description: "Please enter a client name.",
        });
        return;
      }
      addClient(formData);
      setFormData({ name: "", email: "", phone: "" });
      setIsAddClientOpen(false);
    };

    return (
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Add a new client to your list. Name is required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="col-span-3"
                  placeholder="Client name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="col-span-3"
                  placeholder="client@example.com"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="col-span-3"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddClientOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Client</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const TransactionDialog = () => {
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!transactionDialog.client || !transactionDialog.type) return;
      
      const numAmount = parseFloat(amount);
      if (!numAmount || numAmount <= 0) {
        toast({
          variant: "destructive",
          title: "Invalid amount",
          description: "Please enter a valid amount greater than 0.",
        });
        return;
      }

      if (!description.trim()) {
        toast({
          variant: "destructive",
          title: "Description required",
          description: "Please enter a description for this transaction.",
        });
        return;
      }

      addTransaction(transactionDialog.client.id, transactionDialog.type, numAmount, description.trim());
      setAmount("");
      setDescription("");
      setTransactionDialog({ open: false });
    };

    if (!transactionDialog.client || !transactionDialog.type) return null;

    const isCredit = transactionDialog.type === 'credit';
    const title = isCredit ? "Add Money to Tab" : "Deduct from Tab";

    return (
      <Dialog open={transactionDialog.open} onOpenChange={(open) => setTransactionDialog({ ...transactionDialog, open })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {isCredit ? "Add money to" : "Record a purchase and deduct from"} {transactionDialog.client.name}'s tab.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">Amount *</Label>
                <div className="col-span-3 relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right mt-2">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-3"
                  placeholder={isCredit ? "Payment received, deposit, etc." : "Item purchased, service provided, etc."}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTransactionDialog({ open: false })}>
                Cancel
              </Button>
              <Button type="submit">
                {isCredit ? "Add Money" : "Record Purchase"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Owed</CardTitle>
            <div className="text-xs text-muted-foreground">$</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalOwed.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Clients</h2>
        <Button onClick={() => setIsAddClientOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      <ClientsTable />

      <AddClientDialog />
      <TransactionDialog />
    </div>
  );
};