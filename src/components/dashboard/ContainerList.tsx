import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Square, RotateCcw, Settings, Terminal } from "lucide-react";

export function ContainerList() {
  // Mock container data - would come from API
  const containers = [
    {
      id: 100,
      name: "web-server",
      description: "Nginx Web Server",
      status: "running",
      cpu: 15,
      memory: 45,
      disk: 23,
      network: "192.168.1.100",
      uptime: "2d 4h 32m",
      template: "debian-12-standard",
      cores: 2,
      ram: "1024MB",
    },
    {
      id: 101,
      name: "database",
      description: "PostgreSQL Database",
      status: "running",
      cpu: 35,
      memory: 78,
      disk: 67,
      network: "192.168.1.101",
      uptime: "5d 2h 15m",
      template: "debian-12-standard",
      cores: 4,
      ram: "4096MB",
    },
    {
      id: 102,
      name: "backup-service",
      description: "Backup & Archive Service",
      status: "stopped",
      cpu: 0,
      memory: 0,
      disk: 12,
      network: "192.168.1.102",
      uptime: "-",
      template: "debian-12-standard",
      cores: 1,
      ram: "512MB",
    },
    {
      id: 103,
      name: "monitoring",
      description: "Prometheus & Grafana",
      status: "running",
      cpu: 8,
      memory: 23,
      disk: 45,
      network: "192.168.1.103",
      uptime: "1d 8h 22m",
      template: "debian-12-standard",
      cores: 2,
      ram: "2048MB",
    },
    {
      id: 104,
      name: "mail-server",
      description: "Postfix Mail Server",
      status: "error",
      cpu: 0,
      memory: 0,
      disk: 8,
      network: "192.168.1.104",
      uptime: "-",
      template: "debian-12-standard",
      cores: 1,
      ram: "1024MB",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-status-running";
      case "stopped":
        return "bg-status-stopped";
      case "error":
        return "bg-status-error";
      default:
        return "bg-muted";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge className="bg-success/10 text-success border-success/20">Actief</Badge>;
      case "stopped":
        return <Badge variant="secondary">Gestopt</Badge>;
      case "error":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Fout</Badge>;
      default:
        return <Badge variant="outline">Onbekend</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">LXC Containers</h3>
        <Button size="sm" className="bg-gradient-primary text-white">
          <Play className="h-4 w-4 mr-2" />
          Nieuwe Container
        </Button>
      </div>

      <div className="grid gap-4">
        {containers.map((container) => (
          <Card key={container.id} className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(container.status)}`} />
                  <div>
                    <CardTitle className="text-base">{container.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{container.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(container.status)}
                  <Badge variant="outline">LXC {container.id}</Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Configuratie</div>
                  <div className="text-sm text-muted-foreground">
                    <div>{container.cores} Cores</div>
                    <div>{container.ram} RAM</div>
                    <div>{container.template}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Netwerk</div>
                  <div className="text-sm text-muted-foreground">
                    <div>{container.network}</div>
                    <div>Uptime: {container.uptime}</div>
                  </div>
                </div>

                {container.status === "running" && (
                  <>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">CPU Gebruik</div>
                      <Progress value={container.cpu} className="h-2" />
                      <div className="text-xs text-muted-foreground">{container.cpu}%</div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Memory Gebruik</div>
                      <Progress value={container.memory} className="h-2" />
                      <div className="text-xs text-muted-foreground">{container.memory}%</div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex space-x-2">
                  {container.status === "running" ? (
                    <Button variant="outline" size="sm">
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Herstart
                  </Button>
                  <Button variant="outline" size="sm">
                    <Terminal className="h-4 w-4 mr-2" />
                    Console
                  </Button>
                </div>

                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configuratie
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}