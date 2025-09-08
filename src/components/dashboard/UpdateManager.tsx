import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Calendar, Clock, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

export function UpdateManager() {
  const [updating, setUpdating] = useState<string | null>(null);

  // Mock update data
  const updates = [
    {
      id: 100,
      name: "web-server",
      currentVersion: "debian-12.4",
      availableVersion: "debian-12.5",
      updateSize: "245 MB",
      critical: false,
      lastCheck: "2 uur geleden",
      status: "available"
    },
    {
      id: 101,
      name: "database",
      currentVersion: "debian-12.3",
      availableVersion: "debian-12.5",
      updateSize: "312 MB",
      critical: true,
      lastCheck: "2 uur geleden",
      status: "available"
    },
    {
      id: 103,
      name: "monitoring",
      currentVersion: "debian-12.5",
      availableVersion: "debian-12.5",
      updateSize: "-",
      critical: false,
      lastCheck: "2 uur geleden",
      status: "current"
    },
    {
      id: 104,
      name: "mail-server",
      currentVersion: "debian-12.2",
      availableVersion: "debian-12.5",
      updateSize: "178 MB",
      critical: true,
      lastCheck: "2 uur geleden",
      status: "error"
    },
  ];

  const updateHistory = [
    {
      container: "web-server",
      version: "debian-12.4",
      date: "2024-01-05 14:32",
      status: "success",
      duration: "12m 34s"
    },
    {
      container: "database",
      version: "debian-12.3",
      date: "2024-01-03 09:15",
      status: "success",
      duration: "18m 22s"
    },
    {
      container: "monitoring",
      version: "debian-12.5",
      date: "2024-01-02 16:45",
      status: "success",
      duration: "8m 15s"
    },
  ];

  const handleUpdate = async (containerId: number, containerName: string) => {
    setUpdating(containerName);
    // Simulate update process
    setTimeout(() => {
      setUpdating(null);
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <Download className="h-4 w-4 text-warning" />;
      case "current":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Update Beschikbaar</Badge>;
      case "current":
        return <Badge className="bg-success/10 text-success border-success/20">Actueel</Badge>;
      case "error":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Fout</Badge>;
      default:
        return <Badge variant="outline">Onbekend</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Update Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Update Beheer
            <Button className="bg-gradient-primary text-white">
              <Download className="h-4 w-4 mr-2" />
              Alle Updates Installeren
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-warning">3</div>
              <div className="text-sm text-muted-foreground">Updates Beschikbaar</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-success">1</div>
              <div className="text-sm text-muted-foreground">Containers Actueel</div>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold text-muted-foreground">735 MB</div>
              <div className="text-sm text-muted-foreground">Totale Download</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Updates */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Container Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {updates.map((update) => (
              <div
                key={update.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg bg-gradient-card"
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(update.status)}
                  <div>
                    <div className="font-medium">{update.name}</div>
                    <div className="text-sm text-muted-foreground">LXC {update.id}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-sm">
                    <div className="text-muted-foreground">Huidige Versie</div>
                    <div className="font-medium">{update.currentVersion}</div>
                  </div>
                  {update.status === "available" && (
                    <>
                      <div className="text-sm">
                        <div className="text-muted-foreground">Nieuwe Versie</div>
                        <div className="font-medium">{update.availableVersion}</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-muted-foreground">Download</div>
                        <div className="font-medium">{update.updateSize}</div>
                      </div>
                    </>
                  )}
                  <div className="flex items-center space-x-2">
                    {update.critical && (
                      <Badge className="bg-destructive/10 text-destructive border-destructive/20">Kritiek</Badge>
                    )}
                    {getStatusBadge(update.status)}
                    {update.status === "available" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(update.id, update.name)}
                        disabled={updating === update.name}
                        className="bg-gradient-primary text-white"
                      >
                        {updating === update.name ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Update
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Update History */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Update Geschiedenis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {updateHistory.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-border rounded-lg bg-gradient-card"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <div>
                    <div className="font-medium">{item.container}</div>
                    <div className="text-sm text-muted-foreground">{item.version}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-muted-foreground">{item.date}</div>
                  <div className="text-sm text-muted-foreground">Duur: {item.duration}</div>
                  <Badge className="bg-success/10 text-success border-success/20">Voltooid</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}