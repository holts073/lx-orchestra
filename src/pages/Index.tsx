import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Overview } from "@/components/dashboard/Overview";
import { ContainerList } from "@/components/dashboard/ContainerList";
import { UpdateManager } from "@/components/dashboard/UpdateManager";
import { ProxmoxConfig } from "@/components/dashboard/ProxmoxConfig";
import { UserManagement } from "@/components/dashboard/UserManagement";
import { ServerSettings } from "@/components/dashboard/ServerSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview />;
      case "containers":
        return <ContainerList />;
      case "updates":
        return <UpdateManager />;
      case "schedule":
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Update Schema</h3>
            <p className="text-muted-foreground">Configureer automatische updates en onderhoudsvensters.</p>
          </div>
        );
      case "logs":
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">System Logs</h3>
            <p className="text-muted-foreground">Bekijk logs van alle container operaties en updates.</p>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Instellingen</h2>
              <p className="text-muted-foreground">
                Beheer systeem-, gebruikers- en Proxmox-instellingen
              </p>
            </div>
            <Tabs defaultValue="proxmox" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="proxmox">Proxmox</TabsTrigger>
                <TabsTrigger value="users">Gebruikers</TabsTrigger>
                <TabsTrigger value="server">Server</TabsTrigger>
              </TabsList>
              <TabsContent value="proxmox" className="mt-6">
                <ProxmoxConfig />
              </TabsContent>
              <TabsContent value="users" className="mt-6">
                <UserManagement />
              </TabsContent>
              <TabsContent value="server" className="mt-6">
                <ServerSettings />
              </TabsContent>
            </Tabs>
          </div>
        );
      default:
        return <Overview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
