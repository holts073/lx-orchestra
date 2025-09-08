#!/bin/bash
set -e

# 1️⃣ Update & upgrade
apt update && apt upgrade -y

# 2️⃣ Vereiste pakketten
apt install -y curl gnupg lsb-release ca-certificates sudo software-properties-common

# 3️⃣ Docker repository toevoegen
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list
apt update

# 4️⃣ Docker Engine installeren
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 5️⃣ Oude containers opruimen
docker rm -f node_exporter cadvisor watchtower portainer_agent || true

# 6️⃣ Portainer Agent starten
docker run -d \
  --name portainer_agent \
  --restart unless-stopped \
  -p 9001:9001 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /var/lib/docker/volumes:/var/lib/docker/volumes \
  portainer/agent:lts

# 7️⃣ Monitoring containers automatisch starten

# Node Exporter
docker run -d \
  --name node_exporter \
  --network host \
  --restart unless-stopped \
  quay.io/prometheus/node-exporter:latest \
  --no-collector.thermal_zone \
  --no-collector.hwmon \
  --no-collector.wifi \
  --no-collector.edac \
  --no-collector.bcache \
  --no-collector.infiniband \
  --no-collector.nvme

# cAdvisor
docker run -d \
  --name cadvisor \
  --restart unless-stopped \
  -p 8080:8080 \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v /sys:/sys:ro \
  -v /var/lib/docker/:/var/lib/docker:ro \
  gcr.io/cadvisor/cadvisor:latest \
  --disable_metrics=cpufreq,thermal_zone,hugepages

# Watchtower
docker run -d \
  --name watchtower \
  --restart always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --cleanup --interval 86400

# 8️⃣ Status overzicht
echo "✅ Docker, Portainer Agent en monitoring containers draaien:"
docker ps
