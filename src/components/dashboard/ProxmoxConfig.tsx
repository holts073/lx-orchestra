import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { proxmoxApi, type ProxmoxConfig } from "@/services/proxmoxApi";
import { useToast } from "@/hooks/use-toast";

export function ProxmoxConfig() {
  const [config, setConfig] = useState<ProxmoxConfig>({
    host: localStorage.getItem('proxmox_host') || '',
    port: parseInt(localStorage.getItem('proxmox_port') || '8006'),
    username: localStorage.getItem('proxmox_username') || 'root@pam',
    password: '',
    node: localStorage.getItem('proxmox_node') || 'pve',
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [nodes, setNodes] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Test connection on component mount if config exists
    if (config.host && config.username) {
      testConnection();
    }
  }, []);

  const handleConfigChange = (key: keyof ProxmoxConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const testConnection = async () => {
    if (!config.host || !config.username || !config.password) {
      toast({
        title: "Incomplete configuratie",
        description: "Vul alle vereiste velden in.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    try {
      proxmoxApi.setConfig(config);
      const availableNodes = await proxmoxApi.getNodes();
      setNodes(availableNodes);
      setIsConnected(true);
      
      // Save to localStorage (except password)
      localStorage.setItem('proxmox_host', config.host);
      localStorage.setItem('proxmox_port', config.port.toString());
      localStorage.setItem('proxmox_username', config.username);
      localStorage.setItem('proxmox_node', config.node || 'pve');

      toast({
        title: "Verbinding succesvol",
        description: `Verbonden met Proxmox host ${config.host}`,
      });
    } catch (error) {
      setIsConnected(false);
      toast({
        title: "Verbinding gefaald",
        description: "Controleer je Proxmox instellingen en netwerk connectie.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const clearConfig = () => {
    localStorage.removeItem('proxmox_host');
    localStorage.removeItem('proxmox_port');
    localStorage.removeItem('proxmox_username');
    localStorage.removeItem('proxmox_node');
    setConfig({
      host: '',
      port: 8006,
      username: 'root@pam',
      password: '',
      node: 'pve',
    });
    setIsConnected(false);
    setNodes([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Proxmox Configuratie</h3>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <Badge className="bg-success/10 text-success border-success/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verbonden
            </Badge>
          ) : (
            <Badge variant="outline">
              <XCircle className="h-3 w-3 mr-1" />
              Niet verbonden
            </Badge>
          )}
        </div>
      </div>

      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          Configureer de verbinding met je Proxmox VE server om LXC containers automatisch te detecteren.
          <strong> Zorg ervoor dat CORS is geconfigureerd op je Proxmox server.</strong>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Server Instellingen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host">Proxmox Host/IP</Label>
              <Input
                id="host"
                placeholder="192.168.1.100 of proxmox.local"
                value={config.host}
                onChange={(e) => handleConfigChange('host', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Poort</Label>
              <Input
                id="port"
                type="number"
                placeholder="8006"
                value={config.port}
                onChange={(e) => handleConfigChange('port', parseInt(e.target.value) || 8006)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Gebruikersnaam</Label>
              <Input
                id="username"
                placeholder="root@pam"
                value={config.username}
                onChange={(e) => handleConfigChange('username', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Wachtwoord</Label>
              <Input
                id="password"
                type="password"
                placeholder="Proxmox wachtwoord"
                value={config.password}
                onChange={(e) => handleConfigChange('password', e.target.value)}
              />
            </div>
          </div>

          {nodes.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="node">Proxmox Node</Label>
              <select
                id="node"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                value={config.node}
                onChange={(e) => handleConfigChange('node', e.target.value)}
              >
                {nodes.map(node => (
                  <option key={node} value={node}>{node}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            <Button 
              onClick={testConnection} 
              disabled={isTesting}
              className="bg-gradient-primary text-white"
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testen...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Test Verbinding
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={clearConfig}>
              Reset Configuratie
            </Button>
          </div>
        </CardContent>
      </Card>

      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detectie Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Proxmox Nodes:</span>
                <span className="text-sm font-medium">{nodes.length} gevonden</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Actieve Node:</span>
                <span className="text-sm font-medium">{config.node}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">API Versie:</span>
                <span className="text-sm font-medium">REST API v2</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}