import { Container, Server, Settings, Activity, Calendar, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  {
    id: "overview",
    label: "Overzicht",
    icon: Container,
  },
  {
    id: "containers",
    label: "LXC Containers",
    icon: Server,
  },
  {
    id: "updates",
    label: "Updates",
    icon: Activity,
  },
  {
    id: "schedule",
    label: "Schema",
    icon: Calendar,
  },
  {
    id: "logs",
    label: "Logs",
    icon: LogIn,
  },
  {
    id: "settings",
    label: "Instellingen",
    icon: Settings,
  },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Container className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">LXC Manager</h1>
            <p className="text-xs text-muted-foreground">Container Beheer</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    activeTab === item.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-muted-foreground">
          <p>LXC Manager v1.0</p>
          <p>Debian 12 Docker</p>
        </div>
      </div>
    </aside>
  );
}