import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Container, Activity, Clock, AlertTriangle } from "lucide-react";

export function Overview() {
  // Mock data - in real app this would come from your backend API
  const stats = {
    totalContainers: 12,
    runningContainers: 8,
    stoppedContainers: 3,
    errorContainers: 1,
    lastUpdate: "2 uur geleden",
    updatesPending: 3,
  };

  const containers = [
    { id: 100, name: "web-server", status: "running", cpu: 15, memory: 45, uptime: "2d 4h" },
    { id: 101, name: "database", status: "running", cpu: 35, memory: 78, uptime: "5d 2h" },
    { id: 102, name: "backup-service", status: "stopped", cpu: 0, memory: 0, uptime: "-" },
    { id: 103, name: "monitoring", status: "running", cpu: 8, memory: 23, uptime: "1d 8h" },
    { id: 104, name: "mail-server", status: "error", cpu: 0, memory: 0, uptime: "-" },
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
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Containers</CardTitle>
            <Container className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContainers}</div>
            <p className="text-xs text-muted-foreground">Actieve configuratie</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actieve Containers</CardTitle>
            <Activity className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.runningContainers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.runningContainers / stats.totalContainers) * 100)}% van totaal
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Updates Beschikbaar</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.updatesPending}</div>
            <p className="text-xs text-muted-foreground">Laatste check: {stats.lastUpdate}</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Problemen</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.errorContainers}</div>
            <p className="text-xs text-muted-foreground">Aandacht vereist</p>
          </CardContent>
        </Card>
      </div>

      {/* Container List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Container Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {containers.map((container) => (
              <div
                key={container.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg bg-gradient-card"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(container.status)}`} />
                  <div>
                    <div className="font-medium">{container.name}</div>
                    <div className="text-sm text-muted-foreground">LXC {container.id}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  {container.status === "running" && (
                    <>
                      <div className="text-sm">
                        <div className="text-muted-foreground">CPU</div>
                        <div className="font-medium">{container.cpu}%</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-muted-foreground">RAM</div>
                        <div className="font-medium">{container.memory}%</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-muted-foreground">Uptime</div>
                        <div className="font-medium">{container.uptime}</div>
                      </div>
                    </>
                  )}
                  {getStatusBadge(container.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}