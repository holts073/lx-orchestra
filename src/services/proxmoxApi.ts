// Proxmox API service voor LXC management
export interface ProxmoxContainer {
  vmid: number;
  name: string;
  status: 'running' | 'stopped' | 'error';
  cpu: number;
  memory: number;
  disk: number;
  maxcpu: number;
  maxmem: number;
  maxdisk: number;
  uptime: number;
  template: string;
  net0?: string;
  node: string;
  services?: ContainerService[];
}

export interface ContainerService {
  name: string;
  type: 'systemd' | 'docker' | 'process';
  status: 'running' | 'stopped' | 'error';
  port?: number;
  description?: string;
}

export interface ProxmoxConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  apiToken?: string;
  useApiToken: boolean;
  node?: string;
}

class ProxmoxApiService {
  private config: ProxmoxConfig | null = null;

  setConfig(config: ProxmoxConfig) {
    this.config = config;
  }

  private async makeRequest(endpoint: string) {
    if (!this.config) {
      throw new Error('Proxmox configuration not set');
    }

    const url = `https://${this.config.host}:${this.config.port}/api2/json${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.useApiToken && this.config.apiToken) {
      headers['Authorization'] = `PVEAPIToken=${this.config.apiToken}`;
    } else {
      headers['Authorization'] = `Basic ${btoa(`${this.config.username}:${this.config.password}`)}`;
    }
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        // In production, you'd handle CORS and certificates properly
      });

      if (!response.ok) {
        throw new Error(`Proxmox API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Proxmox API request failed:', error);
      throw error;
    }
  }

  async getNodes(): Promise<string[]> {
    try {
      const nodes = await this.makeRequest('/nodes');
      return nodes.map((node: any) => node.node);
    } catch {
      // Return default node if API fails
      return [this.config?.node || 'pve'];
    }
  }

  async getContainers(node?: string): Promise<ProxmoxContainer[]> {
    const targetNode = node || this.config?.node || 'pve';
    
    try {
      const containers = await this.makeRequest(`/nodes/${targetNode}/lxc`);
      
      return containers.map((container: any) => ({
        vmid: container.vmid,
        name: container.name || `CT${container.vmid}`,
        status: this.mapStatus(container.status),
        cpu: Math.round((container.cpu || 0) * 100),
        memory: Math.round(((container.mem || 0) / (container.maxmem || 1)) * 100),
        disk: Math.round(((container.disk || 0) / (container.maxdisk || 1)) * 100),
        maxcpu: container.maxcpu || 1,
        maxmem: container.maxmem || 1024 * 1024 * 1024, // 1GB default
        maxdisk: container.maxdisk || 10 * 1024 * 1024 * 1024, // 10GB default
        uptime: container.uptime || 0,
        template: container.template || 'debian-12-standard',
        net0: container.net0,
        node: targetNode,
      }));
    } catch (error) {
      console.error('Failed to fetch containers from Proxmox:', error);
      // Return mock data as fallback
      return this.getMockContainers();
    }
  }

  private mapStatus(proxmoxStatus: string): 'running' | 'stopped' | 'error' {
    switch (proxmoxStatus) {
      case 'running':
        return 'running';
      case 'stopped':
        return 'stopped';
      default:
        return 'error';
    }
  }

  private getMockContainers(): ProxmoxContainer[] {
    return [
      {
        vmid: 100,
        name: "web-server",
        status: "running",
        cpu: 15,
        memory: 45,
        disk: 23,
        maxcpu: 2,
        maxmem: 1024 * 1024 * 1024,
        maxdisk: 20 * 1024 * 1024 * 1024,
        uptime: 187200, // 2d 4h 32m in seconds
        template: "debian-12-standard",
        net0: "192.168.1.100",
        node: "pve",
      },
      {
        vmid: 101,
        name: "database",
        status: "running",
        cpu: 35,
        memory: 78,
        disk: 67,
        maxcpu: 4,
        maxmem: 4096 * 1024 * 1024,
        maxdisk: 50 * 1024 * 1024 * 1024,
        uptime: 439200, // 5d 2h 15m in seconds
        template: "debian-12-standard",
        net0: "192.168.1.101",
        node: "pve",
      },
      {
        vmid: 102,
        name: "backup-service",
        status: "stopped",
        cpu: 0,
        memory: 0,
        disk: 12,
        maxcpu: 1,
        maxmem: 512 * 1024 * 1024,
        maxdisk: 20 * 1024 * 1024 * 1024,
        uptime: 0,
        template: "debian-12-standard",
        net0: "192.168.1.102",
        node: "pve",
      },
      {
        vmid: 103,
        name: "monitoring",
        status: "running",
        cpu: 8,
        memory: 23,
        disk: 45,
        maxcpu: 2,
        maxmem: 2048 * 1024 * 1024,
        maxdisk: 30 * 1024 * 1024 * 1024,
        uptime: 116400, // 1d 8h 22m in seconds
        template: "debian-12-standard",
        net0: "192.168.1.103",
        node: "pve",
      },
      {
        vmid: 104,
        name: "mail-server",
        status: "error",
        cpu: 0,
        memory: 0,
        disk: 8,
        maxcpu: 1,
        maxmem: 1024 * 1024 * 1024,
        maxdisk: 20 * 1024 * 1024 * 1024,
        uptime: 0,
        template: "debian-12-standard",
        net0: "192.168.1.104",
        node: "pve",
      },
    ];
  }

  async startContainer(node: string, vmid: number): Promise<void> {
    try {
      await this.makePostRequest(`/nodes/${node}/lxc/${vmid}/status/start`);
    } catch (error) {
      console.error(`Failed to start container ${vmid}:`, error);
      throw error;
    }
  }

  async stopContainer(node: string, vmid: number): Promise<void> {
    try {
      await this.makePostRequest(`/nodes/${node}/lxc/${vmid}/status/stop`);
    } catch (error) {
      console.error(`Failed to stop container ${vmid}:`, error);
      throw error;
    }
  }

  async restartContainer(node: string, vmid: number): Promise<void> {
    try {
      await this.makePostRequest(`/nodes/${node}/lxc/${vmid}/status/reboot`);
    } catch (error) {
      console.error(`Failed to restart container ${vmid}:`, error);
      throw error;
    }
  }

  async getContainerServices(node: string, vmid: number): Promise<ContainerService[]> {
    try {
      // In a real implementation, this would call the Proxmox API
      // For now, return mock data
      return this.getMockServices(vmid);
    } catch (error) {
      console.error(`Failed to get services for container ${vmid}:`, error);
      return this.getMockServices(vmid);
    }
  }

  private async makePostRequest(endpoint: string, data?: any) {
    if (!this.config) {
      throw new Error('Proxmox configuration not set');
    }

    const url = `https://${this.config.host}:${this.config.port}/api2/json${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.useApiToken && this.config.apiToken) {
      headers['Authorization'] = `PVEAPIToken=${this.config.apiToken}`;
    } else {
      headers['Authorization'] = `Basic ${btoa(`${this.config.username}:${this.config.password}`)}`;
    }
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Proxmox API error: ${response.status}`);
      }

      const responseData = await response.json();
      return responseData.data;
    } catch (error) {
      console.error('Proxmox API POST request failed:', error);
      throw error;
    }
  }

  formatUptime(seconds: number): string {
    if (seconds === 0) return "-";
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  private getMockServices(vmid: number): ContainerService[] {
    const serviceMap: Record<number, ContainerService[]> = {
      100: [ // web-server
        { name: 'nginx', type: 'systemd', status: 'running', port: 80, description: 'Web server' },
        { name: 'php8.2-fpm', type: 'systemd', status: 'running', port: 9000, description: 'PHP FastCGI' },
        { name: 'redis', type: 'docker', status: 'running', port: 6379, description: 'Cache database' },
      ],
      101: [ // database
        { name: 'postgresql', type: 'systemd', status: 'running', port: 5432, description: 'PostgreSQL Database' },
        { name: 'pgbouncer', type: 'systemd', status: 'running', port: 6432, description: 'Connection pooler' },
      ],
      102: [ // backup-service
        { name: 'restic', type: 'process', status: 'stopped', description: 'Backup service' },
        { name: 'cron', type: 'systemd', status: 'stopped', description: 'Task scheduler' },
      ],
      103: [ // monitoring
        { name: 'prometheus', type: 'docker', status: 'running', port: 9090, description: 'Monitoring system' },
        { name: 'grafana', type: 'docker', status: 'running', port: 3000, description: 'Analytics dashboard' },
        { name: 'node-exporter', type: 'systemd', status: 'running', port: 9100, description: 'System metrics' },
      ],
      104: [ // mail-server
        { name: 'postfix', type: 'systemd', status: 'error', port: 25, description: 'SMTP server' },
        { name: 'dovecot', type: 'systemd', status: 'error', port: 993, description: 'IMAP server' },
      ],
    };
    
    return serviceMap[vmid] || [];
  }
}

export const proxmoxApi = new ProxmoxApiService();