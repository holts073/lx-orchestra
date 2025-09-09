import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Play, Square, RotateCcw, Settings, Terminal, RefreshCw, AlertTriangle, ChevronDown, Server, Container, Activity } from "lucide-react";
import { proxmoxApi, ProxmoxContainer, ContainerService } from "@/services/proxmoxApi";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";

export function ContainerList() {
  const [containers, setContainers] = useState<ProxmoxContainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<number, string>>({});
  const [expandedServices, setExpandedServices] = useState<Record<number, boolean>>({});
  const { toast } = useToast();
  const { addNotification } = useNotifications();

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

  const handleContainerAction = async (vmid: number, action: string, node: string) => {
    setActionLoading(prev => ({ ...prev, [vmid]: action }));
    
    try {
      switch (action) {
        case 'start':
          await proxmoxApi.startContainer(node, vmid);
          break;
        case 'stop':
          await proxmoxApi.stopContainer(node, vmid);
          break;
        case 'restart':
          await proxmoxApi.restartContainer(node, vmid);
          break;
        case 'console':
          // Open console in new window - in real implementation this would be a noVNC connection
          window.open(`https://your-proxmox-host:8006/?console=lxc&vmid=${vmid}&node=${node}`, '_blank');
          toast({
            title: "Console Geopend",
            description: `Console voor container ${vmid} geopend in nieuw venster`,
          });
          return;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      toast({
        title: `Container ${action}`,
        description: `${action} actie succesvol uitgevoerd voor container ${vmid}`,
      });

      addNotification({
        type: 'success',
        title: 'Container Actie',
        message: `Container ${vmid} - ${action} succesvol uitgevoerd`,
        read: false,
        containerId: vmid,
      });
      
      // Refresh containers after action
      await loadContainers();
    } catch (error) {
      console.error(`Failed to ${action} container ${vmid}:`, error);
      toast({
        title: "Fout",
        description: `Kon ${action} actie niet uitvoeren voor container ${vmid}`,
        variant: "destructive",
      });

      addNotification({
        type: 'error',
        title: 'Container Fout',
        message: `Container ${vmid} - ${action} actie mislukt`,
        read: false,
        containerId: vmid,
      });
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[vmid];
        return newState;
      });
    }
  };

  const loadContainerServices = async (vmid: number, node: string) => {
    try {
      const services = await proxmoxApi.getContainerServices(node, vmid);
      setContainers(prev => 
        prev.map(container => 
          container.vmid === vmid 
            ? { ...container, services }
            : container
        )
      );
    } catch (error) {
      console.error(`Failed to load services for container ${vmid}:`, error);
    }
  };

  const toggleServicesView = async (vmid: number, node: string) => {
    setExpandedServices(prev => ({ ...prev, [vmid]: !prev[vmid] }));
    
    if (!expandedServices[vmid]) {
      await loadContainerServices(vmid, node);
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

              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleContainerAction(container.vmid, 'start', container.node)}
                  disabled={container.status === 'running' || actionLoading[container.vmid] === 'start'}
                >
                  {actionLoading[container.vmid] === 'start' ? (
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-1" />
                  )}
                  Start
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleContainerAction(container.vmid, 'stop', container.node)}
                  disabled={container.status === 'stopped' || actionLoading[container.vmid] === 'stop'}
                >
                  {actionLoading[container.vmid] === 'stop' ? (
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Square className="w-4 h-4 mr-1" />
                  )}
                  Stop
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleContainerAction(container.vmid, 'restart', container.node)}
                  disabled={container.status !== 'running' || actionLoading[container.vmid] === 'restart'}
                >
                  {actionLoading[container.vmid] === 'restart' ? (
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4 mr-1" />
                  )}
                  Herstart
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleContainerAction(container.vmid, 'console', container.node)}
                >
                  <Terminal className="w-4 h-4 mr-1" />
                  Console
                </Button>
              </div>

              {/* Services Section */}
              <Collapsible open={expandedServices[container.vmid]} onOpenChange={() => toggleServicesView(container.vmid, container.node)}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between mt-4 p-2">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      <span>Services & Docker Containers</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedServices[container.vmid] ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  {container.services && container.services.length > 0 ? (
                    container.services.map((service: ContainerService, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {service.type === 'docker' ? (
                              <Container className="w-4 h-4 text-blue-500" />
                            ) : service.type === 'systemd' ? (
                              <Server className="w-4 h-4 text-green-500" />
                            ) : (
                              <Activity className="w-4 h-4 text-orange-500" />
                            )}
                            <span className="font-medium">{service.name}</span>
                          </div>
                          <Badge variant={service.status === 'running' ? 'default' : service.status === 'stopped' ? 'secondary' : 'destructive'}>
                            {service.status}
                          </Badge>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>{service.description}</div>
                          {service.port && (
                            <div className="text-xs">Port: {service.port}</div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Server className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Geen services gevonden</p>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}