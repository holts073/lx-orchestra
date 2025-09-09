import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Server, Save, RotateCcw, Shield, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ServerConfig {
  serverName: string;
  port: number;
  httpsEnabled: boolean;
  autoUpdates: boolean;
  updateInterval: string;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  maxLogSize: number;
  sessionTimeout: number;
  corsOrigins: string;
  backupEnabled: boolean;
  backupInterval: string;
}

export function ServerSettings() {
  const [config, setConfig] = useState<ServerConfig>({
    serverName: localStorage.getItem('server_name') || 'LXC Manager',
    port: parseInt(localStorage.getItem('server_port') || '8080'),
    httpsEnabled: localStorage.getItem('https_enabled') === 'true',
    autoUpdates: localStorage.getItem('auto_updates') !== 'false',
    updateInterval: localStorage.getItem('update_interval') || '24h',
    logLevel: (localStorage.getItem('log_level') as ServerConfig['logLevel']) || 'info',
    maxLogSize: parseInt(localStorage.getItem('max_log_size') || '100'),
    sessionTimeout: parseInt(localStorage.getItem('session_timeout') || '3600'),
    corsOrigins: localStorage.getItem('cors_origins') || '*',
    backupEnabled: localStorage.getItem('backup_enabled') === 'true',
    backupInterval: localStorage.getItem('backup_interval') || '7d',
  });

  const [isModified, setIsModified] = useState(false);
  const { toast } = useToast();

  const handleConfigChange = (key: keyof ServerConfig, value: string | number | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setIsModified(true);
  };

  const saveSettings = () => {
    // Save to localStorage (in a real app, this would be an API call)
    localStorage.setItem('server_name', config.serverName);
    localStorage.setItem('server_port', config.port.toString());
    localStorage.setItem('https_enabled', config.httpsEnabled.toString());
    localStorage.setItem('auto_updates', config.autoUpdates.toString());
    localStorage.setItem('update_interval', config.updateInterval);
    localStorage.setItem('log_level', config.logLevel);
    localStorage.setItem('max_log_size', config.maxLogSize.toString());
    localStorage.setItem('session_timeout', config.sessionTimeout.toString());
    localStorage.setItem('cors_origins', config.corsOrigins);
    localStorage.setItem('backup_enabled', config.backupEnabled.toString());
    localStorage.setItem('backup_interval', config.backupInterval);

    setIsModified(false);
    toast({
      title: "Instellingen opgeslagen",
      description: "Server instellingen zijn succesvol bijgewerkt.",
    });
  };

  const resetSettings = () => {
    setConfig({
      serverName: 'LXC Manager',
      port: 8080,
      httpsEnabled: false,
      autoUpdates: true,
      updateInterval: '24h',
      logLevel: 'info',
      maxLogSize: 100,
      sessionTimeout: 3600,
      corsOrigins: '*',
      backupEnabled: false,
      backupInterval: '7d',
    });
    setIsModified(true);
  };

  const restartServer = () => {
    toast({
      title: "Server herstart gepland",
      description: "De server wordt opnieuw opgestart om wijzigingen toe te passen.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Server Instellingen</h3>
          <p className="text-sm text-muted-foreground">Configureer webserver en systeeminstellingen</p>
        </div>
        {isModified && (
          <Badge variant="outline" className="animate-pulse">
            Niet opgeslagen wijzigingen
          </Badge>
        )}
      </div>

      <div className="grid gap-6">
        {/* Basic Server Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4" />
              Basis Instellingen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serverName">Server Naam</Label>
                <Input
                  id="serverName"
                  value={config.serverName}
                  onChange={(e) => handleConfigChange('serverName', e.target.value)}
                  placeholder="LXC Manager"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Poort</Label>
                <Input
                  id="port"
                  type="number"
                  value={config.port}
                  onChange={(e) => handleConfigChange('port', parseInt(e.target.value) || 8080)}
                  placeholder="8080"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>HTTPS Inschakelen</Label>
                <p className="text-sm text-muted-foreground">
                  Gebruik beveiligde HTTPS verbindingen
                </p>
              </div>
              <Switch
                checked={config.httpsEnabled}
                onCheckedChange={(checked) => handleConfigChange('httpsEnabled', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="corsOrigins">CORS Origins</Label>
              <Textarea
                id="corsOrigins"
                value={config.corsOrigins}
                onChange={(e) => handleConfigChange('corsOrigins', e.target.value)}
                placeholder="* of specifieke origins gescheiden door komma's"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Beveiliging
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Sessie Timeout (seconden)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={config.sessionTimeout}
                onChange={(e) => handleConfigChange('sessionTimeout', parseInt(e.target.value) || 3600)}
                placeholder="3600"
              />
              <p className="text-xs text-muted-foreground">
                Standaard: 3600 seconden (1 uur)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Updates & Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Updates & Onderhoud
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatische Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Controleer automatisch op LXC updates
                </p>
              </div>
              <Switch
                checked={config.autoUpdates}
                onCheckedChange={(checked) => handleConfigChange('autoUpdates', checked)}
              />
            </div>

            {config.autoUpdates && (
              <div className="space-y-2">
                <Label htmlFor="updateInterval">Update Interval</Label>
                <Select 
                  value={config.updateInterval} 
                  onValueChange={(value) => handleConfigChange('updateInterval', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Elk uur</SelectItem>
                    <SelectItem value="6h">Elke 6 uur</SelectItem>
                    <SelectItem value="12h">Elke 12 uur</SelectItem>
                    <SelectItem value="24h">Dagelijks</SelectItem>
                    <SelectItem value="7d">Wekelijks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Backup Inschakelen</Label>
                <p className="text-sm text-muted-foreground">
                  Maak automatisch backups van configuraties
                </p>
              </div>
              <Switch
                checked={config.backupEnabled}
                onCheckedChange={(checked) => handleConfigChange('backupEnabled', checked)}
              />
            </div>

            {config.backupEnabled && (
              <div className="space-y-2">
                <Label htmlFor="backupInterval">Backup Interval</Label>
                <Select 
                  value={config.backupInterval} 
                  onValueChange={(value) => handleConfigChange('backupInterval', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Dagelijks</SelectItem>
                    <SelectItem value="7d">Wekelijks</SelectItem>
                    <SelectItem value="30d">Maandelijks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logging Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Logging</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logLevel">Log Level</Label>
                <Select 
                  value={config.logLevel} 
                  onValueChange={(value: ServerConfig['logLevel']) => handleConfigChange('logLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxLogSize">Max Log Grootte (MB)</Label>
                <Input
                  id="maxLogSize"
                  type="number"
                  value={config.maxLogSize}
                  onChange={(e) => handleConfigChange('maxLogSize', parseInt(e.target.value) || 100)}
                  placeholder="100"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={resetSettings}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset naar Standaard
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={restartServer}>
              Server Herstarten
            </Button>
            <Button onClick={saveSettings} disabled={!isModified}>
              <Save className="h-4 w-4 mr-2" />
              Instellingen Opslaan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}