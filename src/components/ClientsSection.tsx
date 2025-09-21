import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ClientsTable } from "./ClientsTable";
import { AddClientDialog } from "./AddClientDialog";
import { TransactionDialog } from "./TransactionDialog";

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

      <ClientsTable
        clients={clients}
        getClientBalance={getClientBalance}
        onAddMoney={(client) => setTransactionDialog({ open: true, client, type: 'credit' })}
        onDeductMoney={(client) => setTransactionDialog({ open: true, client, type: 'debit' })}
        onDeleteClient={deleteClient}
      />

      <AddClientDialog
        open={isAddClientOpen}
        onOpenChange={setIsAddClientOpen}
        onAddClient={addClient}
      />

      <TransactionDialog
        open={transactionDialog.open}
        onOpenChange={(open) => setTransactionDialog({ ...transactionDialog, open })}
        client={transactionDialog.client}
        type={transactionDialog.type}
        onAddTransaction={addTransaction}
      />
    </div>
  );
};