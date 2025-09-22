import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, DollarSign, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalItems: number;
  totalClients: number;
  inventoryValue: number;
  totalOwed: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    totalClients: 0,
    inventoryValue: 0,
    totalOwed: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Get client count
      const { count: clientCount, error: clientError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      if (clientError) throw clientError;

      // Get transactions to calculate total owed
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('*');

      if (transError) throw transError;

      const totalOwed = (transactions || []).reduce((total, transaction) => {
        return transaction.type === 'credit' 
          ? total + transaction.amount 
          : total - transaction.amount;
      }, 0);

      setStats({
        totalItems: 0, // This would come from inventory in a real app
        totalClients: clientCount || 0,
        inventoryValue: 0, // This would come from inventory in a real app
        totalOwed,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error loading dashboard",
        description: "Failed to load dashboard statistics.",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your business overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">Items in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">Active clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.inventoryValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Tabs</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">${stats.totalOwed.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total owed</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-6 border border-dashed border-muted-foreground/25 rounded-lg">
              <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h3 className="font-medium mb-1">Manage Inventory</h3>
              <p className="text-sm text-muted-foreground">Add items, track stock, record sales</p>
            </div>
            <div className="text-center p-6 border border-dashed border-muted-foreground/25 rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h3 className="font-medium mb-1">Client Management</h3>
              <p className="text-sm text-muted-foreground">Track client tabs and transactions</p>
            </div>
            <div className="text-center p-6 border border-dashed border-muted-foreground/25 rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h3 className="font-medium mb-1">View Reports</h3>
              <p className="text-sm text-muted-foreground">Coming soon - Analytics & reports</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;