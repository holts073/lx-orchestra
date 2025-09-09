import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, Square, RotateCcw, Settings, Terminal, RefreshCw, AlertTriangle } from "lucide-react";
import { proxmoxApi, ProxmoxContainer } from "@/services/proxmoxApi";
import { useToast } from "@/hooks/use-toast";

export function ContainerList() {
  const [containers, setContainers] = useState<ProxmoxContainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadContainers();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadContainers, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadContainers = async () => {
    try {
      setError(null);
      const data = await proxmoxApi.getContainers();
      setContainers(data);
    } catch (err) {
      setError('Kan geen verbinding maken met Proxmox. Controleer je configuratie.');
      console.error('Failed to load containers:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadContainers();
  };

  const handleContainerAction = async (action: 'start' | 'stop' | 'restart', container: ProxmoxContainer) => {
    try {
      switch (action) {
        case 'start':
          await proxmoxApi.startContainer(container.node, container.vmid);
          toast({ title: `${container.name} wordt gestart...` });
          break;
        case 'stop':
          await proxmoxApi.stopContainer(container.node, container.vmid);
          toast({ title: `${container.name} wordt gestopt...` });
          break;
        case 'restart':
          await proxmoxApi.restartContainer(container.node, container.vmid);
          toast({ title: `${container.name} wordt herstart...` });
          break;
      }
      
      // Refresh data after action
      setTimeout(loadContainers, 2000);
    } catch (err) {
      toast({
        title: "Actie gefaald",
        description: `Kon ${action} niet uitvoeren op ${container.name}`,
        variant: "destructive"
      });
    }
  };

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">LXC Containers</h3>
        </div>
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-2">Containers laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">LXC Containers</h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Ververs
          </Button>
          <Button size="sm" className="bg-gradient-primary text-white">
            <Play className="h-4 w-4 mr-2" />
            Nieuwe Container
          </Button>
        </div>
      </div>

      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {containers.map((container) => (
          <Card key={container.vmid} className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(container.status)}`} />
                  <div>
                    <CardTitle className="text-base">{container.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">LXC Container - {container.node}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(container.status)}
                  <Badge variant="outline">LXC {container.vmid}</Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Configuratie</div>
                  <div className="text-sm text-muted-foreground">
                    <div>{container.maxcpu} Cores</div>
                    <div>{proxmoxApi.formatBytes(container.maxmem)}</div>
                    <div>{container.template}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Netwerk</div>
                  <div className="text-sm text-muted-foreground">
                    <div>{container.net0 || 'Geen netwerk'}</div>
                    <div>Uptime: {proxmoxApi.formatUptime(container.uptime)}</div>
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleContainerAction('stop', container)}
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleContainerAction('start', container)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleContainerAction('restart', container)}
                  >
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