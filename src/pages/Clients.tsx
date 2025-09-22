import { ClientsSection } from "@/components/ClientsSection";

const Clients = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Client Management</h1>
        <p className="text-muted-foreground">Manage your clients and their account tabs</p>
      </div>
      
      <ClientsSection />
    </div>
  );
};

export default Clients;