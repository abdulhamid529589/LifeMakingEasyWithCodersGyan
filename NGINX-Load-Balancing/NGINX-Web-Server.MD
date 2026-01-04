# NGINX Load Balancing - Complete Guide

## Overview
This guide covers how to implement load balancing using NGINX to handle more requests in your application. We'll also perform load testing to compare performance with and without a load balancer.

## Table of Contents
- [What is NGINX?](#what-is-nginx)
- [Why Do We Need Load Balancing?](#why-do-we-need-load-balancing)
- [Setup Architecture](#setup-architecture)
- [Installation & Configuration](#installation--configuration)
- [Load Balancing Methods](#load-balancing-methods)
- [Advanced Configuration](#advanced-configuration)
- [Load Testing Results](#load-testing-results)

## What is NGINX?

NGINX is a powerful software that serves multiple purposes:
- **Web Server** - Serves static content
- **Reverse Proxy** - Routes requests to backend servers
- **Load Balancer** - Distributes traffic across multiple servers

## Why Do We Need Load Balancing?

### Problem Statement

Consider a typical client-server setup:
- **Frontend** → Makes requests
- **Backend** (Node.js/Python/PHP) → Processes requests
- **Database** → Stores data

This works fine initially, but problems arise when:
1. **Traffic increases significantly**
2. **CPU cores are underutilized**

### Example Scenario

**Server Specs**: 4 CPU cores

**Issue**: Node.js uses only 1 CPU core (single-threaded main thread)
- 1 core in use
- 3 cores sitting idle ❌

### Solution: Load Balancing

Run multiple instances of your application:
- **Instance 1** → Port 3000 (CPU core 1)
- **Instance 2** → Port 3001 (CPU core 2)  
- **Instance 3** → Port 3002 (CPU core 3)
- Keep 1 core free for system operations

**NGINX distributes requests across all instances:**
```
Request 1 → Instance 1
Request 2 → Instance 2
Request 3 → Instance 3
Request 4 → Instance 1 (cycle repeats)
```

This is called **Round Robin** algorithm (default in NGINX).

## Setup Architecture

### Simple Setup (Local Testing)

```
Frontend → NGINX (Port 8000) → Backend Instances
                                  ├─ App 1 (Port 4500)
                                  ├─ App 2 (Port 4501)
                                  └─ App 3 (Port 4502)
```

### Production Setup (Multiple Servers)

```
Frontend → NGINX → Server 1 (3 instances)
                 → Server 2 (3 instances)
```

**Note**: NGINX can load balance across multiple physical machines, not just a single server (this is where it differs from Node.js Cluster module).

## Installation & Configuration

### Prerequisites
- Docker & Docker Compose installed
- Basic understanding of Express.js

### Project Structure

```
project/
├── docker-compose.yml
├── Dockerfile
├── nginx.conf
└── app/ (Express.js application)
```

### Docker Compose Setup

```yaml
version: '3'
services:
  app1:
    image: express-load-balancer
    environment:
      - INSTANCE_ID=1
      - PORT=4500
    ports:
      - "4500:4500"

  app2:
    image: express-load-balancer
    environment:
      - INSTANCE_ID=2
      - PORT=4501
    ports:
      - "4501:4501"

  app3:
    image: express-load-balancer
    environment:
      - INSTANCE_ID=3
      - PORT=4502
    ports:
      - "4502:4502"

  nginx:
    image: nginx:latest
    container_name: nginx-lb
    ports:
      - "8000:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app1
      - app2
      - app3
```

### NGINX Configuration

```nginx
events {
    # Worker configuration (using defaults)
}

http {
    # Define upstream backend servers
    upstream backend {
        server app1:4500;
        server app2:4501;
        server app3:4502;
    }

    server {
        listen 80;

        location / {
            proxy_pass http://backend;
        }
    }
}
```

**Important**: Use Docker service names (app1, app2, app3) instead of `localhost` when running in containers.

### Starting the Application

```bash
# Start all containers
docker-compose up -d

# Check running containers
docker ps

# Stop containers
docker-compose down
```

### Testing

```bash
# Test the endpoint
curl http://localhost:8000

# Should return responses from different instances:
# {"instanceId": "1"}
# {"instanceId": "2"}
# {"instanceId": "3"}
```

## Load Balancing Methods

### 1. Round Robin (Default)
Distributes requests evenly across all servers in a cycle.

```nginx
upstream backend {
    server app1:4500;
    server app2:4501;
    server app3:4502;
}
```

### 2. Least Connections
Routes to server with fewest active connections.

```nginx
upstream backend {
    least_conn;
    server app1:4500;
    server app2:4501;
    server app3:4502;
}
```

### 3. IP Hash
Same client IP always goes to same server (useful for session persistence).

```nginx
upstream backend {
    ip_hash;
    server app1:4500;
    server app2:4501;
    server app3:4502;
}
```

**Use Cases**:
- Session-based authentication stored in files
- Sticky sessions required
- State maintained on specific servers

### 4. Weighted Load Balancing
Distribute more traffic to powerful servers.

```nginx
upstream backend {
    server app1:4500 weight=5;  # Gets 5/6 of traffic
    server app2:4501 weight=1;  # Gets 1/6 of traffic
}
```

## Advanced Configuration

### Marking Servers as Down

Temporarily remove a server from rotation (maintenance/debugging):

```nginx
upstream backend {
    server app1:4500;
    server app2:4501;
    server app3:4502 down;  # This server won't receive traffic
}
```

### Backup Servers

Designate a server as backup (only used when primary servers fail):

```nginx
upstream backend {
    server app1:4500;
    server app2:4501;
    server app3:4502 backup;  # Only used if app1 and app2 fail
}
```

**Testing Backup**:
```bash
# Stop primary servers
docker stop <app1-container-id> <app2-container-id>

# Now requests will go to app3 (backup server)
curl http://localhost:8000
# Returns: {"instanceId": "3"}
```

### Health Checks

NGINX Plus (premium) offers advanced health checks. For open-source version, NGINX performs passive health checks based on failed requests.

## Load Testing Results

### Testing Tool
Using **AutoCannon** for load testing:

```bash
# 30 concurrent connections for 10 seconds
autocannon -c 30 -d 10 http://localhost:8000
```

### Performance Comparison

| Configuration | Requests/Second | Total Requests (10s) |
|--------------|-----------------|---------------------|
| Direct (no NGINX) | 5,595 | 56,000 |
| 1 Server + NGINX | 2,529 | 25,529 |
| 2 Servers + NGINX | 4,424 | 44,240 |
| 3 Servers + NGINX | 5,000+ | 50,000+ |

**Key Observations**:
1. NGINX adds small overhead (intermediary hop)
2. Adding servers increases capacity proportionally
3. Local testing shows higher numbers than real-world scenarios
4. Network latency not a factor in local tests

**Note**: Results are approximate and vary based on hardware and network conditions.

## Common Issues & Solutions

### Issue: 502 Bad Gateway

**Problem**: NGINX can't reach backend servers

**Cause**: Using `localhost` instead of Docker service names

**Solution**:
```nginx
# ❌ Wrong (in Docker)
proxy_pass http://localhost:4500;

# ✅ Correct (in Docker)
proxy_pass http://app1:4500;
```

## NGINX vs Node.js Cluster Module

| Feature | NGINX | Node.js Cluster |
|---------|-------|----------------|
| Single Server | ✓ | ✓ |
| Multiple Servers | ✓ | ✗ |
| Cross-machine | ✓ | ✗ |
| Language Agnostic | ✓ | ✗ (Node.js only) |
| Configuration Flexibility | ✓✓✓ | ✓ |

**When to use NGINX**:
- Multiple physical servers
- Microservices architecture
- Different backend technologies
- Advanced routing needs

**When Cluster Module is enough**:
- Single server deployment
- Node.js only
- Simple setup requirements

## Best Practices

1. **Keep one CPU core free** for system operations
2. **Use health checks** to detect failed instances
3. **Monitor server metrics** (CPU, memory, connections)
4. **Configure timeouts properly** to avoid hanging requests
5. **Use connection pooling** for database connections
6. **Enable keepalive connections** for better performance
7. **Consider sticky sessions** for stateful applications
8. **Use weighted balancing** for heterogeneous servers

## Additional NGINX Features

- **SSL/TLS Termination** - Handle HTTPS at load balancer
- **Caching** - Cache responses to reduce backend load
- **Rate Limiting** - Protect against DDoS
- **Compression** - Gzip responses
- **Request Buffering** - Handle slow clients

## Resources

- [Official NGINX Documentation](https://docs.nginx.com)
- [HTTP Load Balancing](https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/)
- NGINX Crash Course (detailed video tutorial)

## Deployment Considerations

### Production Deployment Options

1. **Separate NGINX Server** (Recommended)
   - Dedicated machine for NGINX
   - Backend servers on separate machines
   - Better isolation and scalability

2. **NGINX on Backend Server**
   - Simpler setup
   - Lower resource usage
   - Suitable for smaller applications

3. **Cloud Load Balancers**
   - AWS ELB, Google Cloud Load Balancer
   - Managed service
   - Higher cost but less maintenance

## Conclusion

Load balancing with NGINX provides:
- ✅ Better resource utilization
- ✅ Increased request handling capacity
- ✅ High availability
- ✅ Horizontal scalability
- ✅ Flexibility in deployment

The small performance overhead is more than compensated by the ability to scale horizontally and handle significantly more traffic.

---

**Remember**: Always test your configuration thoroughly before deploying to production!