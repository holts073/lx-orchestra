import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Overview } from "@/components/dashboard/Overview";
import { ContainerList } from "@/components/dashboard/ContainerList";
import { UpdateManager } from "@/components/dashboard/UpdateManager";

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
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Instellingen</h3>
            <p className="text-muted-foreground">Configureer systeem instellingen en voorkeuren.</p>
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
