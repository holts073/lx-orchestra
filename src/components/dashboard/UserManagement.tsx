import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Edit, Trash2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  lastLogin: string;
  status: 'active' | 'inactive';
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      username: 'admin',
      email: 'admin@homelab.local',
      role: 'admin',
      lastLogin: '2024-01-15 10:30',
      status: 'active'
    },
    {
      id: '2',
      username: 'operator',
      email: 'operator@homelab.local',
      role: 'operator',
      lastLogin: '2024-01-14 16:45',
      status: 'active'
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'viewer' as User['role']
  });

  const { toast } = useToast();

  const handleSaveUser = () => {
    if (!formData.username || !formData.email) {
      toast({
        title: "Onvolledige gegevens",
        description: "Vul alle vereiste velden in.",
        variant: "destructive",
      });
      return;
    }

    if (editingUser) {
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...user, username: formData.username, email: formData.email, role: formData.role }
          : user
      ));
      toast({
        title: "Gebruiker bijgewerkt",
        description: `Gebruiker ${formData.username} is succesvol bijgewerkt.`,
      });
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        username: formData.username,
        email: formData.email,
        role: formData.role,
        lastLogin: '-',
        status: 'active'
      };
      setUsers(prev => [...prev, newUser]);
      toast({
        title: "Gebruiker aangemaakt",
        description: `Gebruiker ${formData.username} is succesvol aangemaakt.`,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ username: '', email: '', password: '', role: 'viewer' });
    setEditingUser(null);
    setIsDialogOpen(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role
    });
    setIsDialogOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    toast({
      title: "Gebruiker verwijderd",
      description: "Gebruiker is succesvol verwijderd.",
    });
  };

  const getRoleBadgeVariant = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'default';
      case 'operator': return 'secondary';
      case 'viewer': return 'outline';
    }
  };

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'admin': return <Shield className="h-3 w-3" />;
      case 'operator': return <Users className="h-3 w-3" />;
      case 'viewer': return <Users className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gebruikersbeheer</h3>
          <p className="text-sm text-muted-foreground">Beheer gebruikerstoegang en rollen</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Gebruiker
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Gebruiker Bewerken' : 'Nieuwe Gebruiker'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Gebruikersnaam</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Voer gebruikersnaam in"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="gebruiker@homelab.local"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Wachtwoord {editingUser && '(laat leeg om ongewijzigd te laten)'}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Voer wachtwoord in"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select value={formData.role} onValueChange={(value: User['role']) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="operator">Operator</SelectItem>
                    <SelectItem value="viewer">Kijker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Annuleren
                </Button>
                <Button onClick={handleSaveUser}>
                  {editingUser ? 'Bijwerken' : 'Aanmaken'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gebruikersoverzicht</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gebruiker</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Laatste Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1 w-fit">
                      {getRoleIcon(user.role)}
                      {user.role === 'admin' ? 'Administrator' : 
                       user.role === 'operator' ? 'Operator' : 'Kijker'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.lastLogin}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status === 'active' ? 'Actief' : 'Inactief'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.username === 'admin'}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}