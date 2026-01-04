# Node.js Cluster Module: Complete Performance Guide

## Overview

Learn how to utilize 100% of your server's CPU power using Node.js Cluster Module. Increase your server's request handling capacity by **3-4x** and reduce latency by **75%**.

**Source:** Codsज्ञान Channel by Rakesh  
**Real Results:**
- Requests/sec: **1,762 → 6,534** (3.7x improvement)
- Average Latency: **16ms → 4ms** (75% reduction)

---

## Table of Contents

1. [The Problem](#the-problem)
2. [The Solution: Cluster Module](#the-solution-cluster-module)
3. [How It Works](#how-it-works)
4. [Implementation Guide](#implementation-guide)
5. [Load Testing Results](#load-testing-results)
6. [Real-World AWS EC2 Testing](#real-world-aws-ec2-testing)
7. [Best Practices](#best-practices)
8. [Limitations & Considerations](#limitations--considerations)
9. [Complete Code Examples](#complete-code-examples)

---

## The Problem

### CPU Underutilization

When you deploy a Node.js application to a server, you're likely using only **20-25% of your CPU power**.

### Why This Happens

```
Server: 4 CPU Cores + 16GB RAM

┌─────────────────────────────────────┐
│ CPU 1  │ CPU 2  │ CPU 3  │ CPU 4   │
├─────────────────────────────────────┤
│ Node.js│  IDLE  │  IDLE  │  IDLE   │
│ Process│        │        │         │
└─────────────────────────────────────┘
```

**The Issue:**
- JavaScript is **single-threaded**
- All tasks execute on **one main thread**
- Only **one CPU core** is utilized
- Other **3 cores sit idle** (wasted resources!)

**Result:**
- ❌ Low request handling capacity
- ❌ Poor CPU utilization
- ❌ Wasted server resources
- ❌ Higher latency under load

---

## The Solution: Cluster Module

### What is the Cluster Module?

A **built-in Node.js module** that:
1. **Forks** your main process into multiple copies
2. Runs **multiple instances** of your application
3. **Load balances** requests automatically
4. Utilizes **all CPU cores**

### Visual Representation

**After Implementing Cluster:**

```
Server: 4 CPU Cores + 16GB RAM

┌─────────────────────────────────────┐
│ CPU 1  │ CPU 2  │ CPU 3  │ CPU 4   │
├─────────────────────────────────────┤
│ Node.js│ Node.js│ Node.js│ Node.js │
│Process1│Process2│Process3│Process4 │
└─────────────────────────────────────┘
        ↑
    Load Balancer
    (Built-in)
```

**Benefits:**
- ✅ 100% CPU utilization
- ✅ 3-4x more requests handled
- ✅ 75% latency reduction
- ✅ Built-in load balancing
- ✅ No external dependencies

---

## How It Works

### Architecture Overview

```
                    ┌──────────────┐
                    │   Requests   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   Primary    │
                    │   Process    │
                    │ (Load Balancer)
                    └──────┬───────┘
                           │
        ┌──────────┬───────┼───────┬──────────┐
        │          │       │       │          │
    ┌───▼───┐ ┌───▼───┐ ┌─▼────┐ ┌───▼───┐
    │Worker │ │Worker │ │Worker│ │Worker │
    │   1   │ │   2   │ │  3   │ │   4   │
    └───────┘ └───────┘ └──────┘ └───────┘
    CPU Core1 CPU Core2 CPU Core3 CPU Core4
```

### Process Flow

1. **Primary Process**
   - Manages worker processes
   - Handles load balancing
   - Does NOT run Express server
   - Monitors worker health

2. **Worker Processes**
   - Each runs full application
   - Each has own memory space
   - Each uses separate CPU core
   - Handle actual requests

3. **Load Balancing**
   - Automatic distribution
   - Built into cluster module
   - Round-robin by default

---

## Implementation Guide

### Step 1: Basic Express Server (Without Cluster)

```javascript
// server.js
import express from 'express';

const app = express();
const PORT = 4400;

app.get('/', (req, res) => {
  // Simulate CPU-intensive work
  let sum = 0;
  for (let i = 0; i < 100000; i++) {
    sum += i;
  }
  
  res.json({ sum });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Step 2: Server With Cluster Module

```javascript
// server-with-cluster.js
import cluster from 'cluster';
import os from 'os';
import express from 'express';

const numCPUs = os.availableParallelism();

if (cluster.isPrimary) {
  // Primary process - forks workers
  console.log(`Primary process ${process.pid} is running`);
  
  // Fork workers for each CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  // Handle worker exit
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    // Optional: Fork a new worker to replace it
    cluster.fork();
  });
  
} else {
  // Worker process - runs Express server
  const app = express();
  const PORT = 4400;
  
  app.get('/', (req, res) => {
    let sum = 0;
    for (let i = 0; i < 100000; i++) {
      sum += i;
    }
    res.json({ sum });
  });
  
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} running on port ${PORT}`);
  });
}
```

### Key Concepts Explained

#### 1. `cluster.isPrimary`

```javascript
if (cluster.isPrimary) {
  // This code runs ONLY in the primary process
  // Used for: forking workers, monitoring
}
```

**Why needed?**
- Same file runs in all processes
- Prevents workers from forking more workers
- Separates orchestration from work

#### 2. `os.availableParallelism()`

```javascript
const numCPUs = os.availableParallelism();
```

- Returns number of CPU cores
- Determines how many workers to fork
- Example: 4 cores = 4 workers

#### 3. `cluster.fork()`

```javascript
cluster.fork();
```

- Creates new worker process
- Copies the current process
- Each worker has own memory space
- Each worker runs same code

---

## Load Testing Results

### Testing Setup

**Tool:** AutoCannon
```bash
npm install -g autocannon
```

**Test Command:**
```bash
autocannon -c 30 -d 10 http://localhost:4400
```

- **Connections:** 30 concurrent
- **Duration:** 10 seconds
- **Target:** Local server

---

### Local Machine Results

#### Configuration
- **CPU Cores:** 10
- **RAM:** 16GB
- **OS:** macOS

#### Without Cluster

```
Test Results (server.js):
─────────────────────────────────
Avg Requests/sec:  6,352
Avg Latency:       4.28 ms
Total Requests:    63,520 (in 10s)
```

#### With Cluster (10 Workers)

```
Test Results (server-with-cluster.js):
─────────────────────────────────
Avg Requests/sec:  19,150
Avg Latency:       1.0 ms
Total Requests:    191,500 (in 10s)
```

**Improvement:**
- Requests: **3x increase** (6,352 → 19,150)
- Latency: **4x reduction** (4.28ms → 1.0ms)

---

## Real-World AWS EC2 Testing

### Test Setup

**Why AWS Testing?**
- Eliminates local machine bias
- Realistic network latency
- Production-like environment

**Infrastructure:**

```
┌─────────────────────┐      ┌─────────────────────┐
│   Load Generator    │──────▶│  Application Server │
│   T2.micro         │      │  T2.xlarge          │
│   1 vCPU           │      │  4 vCPUs            │
│   1GB RAM          │      │  16GB RAM           │
└─────────────────────┘      └─────────────────────┘
```

### AWS EC2 Configuration

#### Server 1: Application Server
- **Instance Type:** T2.xlarge
- **vCPUs:** 4
- **RAM:** 16GB
- **Purpose:** Run Node.js application

#### Server 2: Load Generator
- **Instance Type:** T2.micro
- **vCPUs:** 1
- **RAM:** 1GB
- **Purpose:** Run AutoCannon

---

### AWS Test Results

#### Without Cluster Module

```
Test Results (AWS EC2):
─────────────────────────────────
Avg Requests/sec:  1,762
Avg Latency:       16 ms
CPU Utilization:   ~25% (1 of 4 cores)
```

#### With Cluster Module (4 Workers)

```
Test Results (AWS EC2):
─────────────────────────────────
Avg Requests/sec:  6,534
Avg Latency:       4 ms
CPU Utilization:   ~100% (all 4 cores)
```

**Improvement:**
- **Requests:** 3.7x increase (1,762 → 6,534)
- **Latency:** 75% reduction (16ms → 4ms)
- **CPU Usage:** 25% → 100%

---

## Running the Tests

### Setup Application Server

```bash
# SSH into EC2 instance
ssh -i key.pem ubuntu@<server-ip>

# Create project
mkdir cluster-demo && cd cluster-demo

# Copy your files
# server.js
# server-with-cluster.js

# Run without cluster
node server.js
# Output: Server running on port 4400
```

### Setup Load Generator

```bash
# SSH into load generator
ssh -i key.pem ubuntu@<generator-ip>

# Install AutoCannon
npm install -g autocannon

# Run test (replace with your server IP)
autocannon -c 30 -d 10 http://<server-ip>:4400
```

### Test Sequence

**Test 1: Without Cluster**
```bash
# On server
node server.js

# On generator
autocannon -c 30 -d 10 http://<server-ip>:4400
# Result: ~1,762 req/sec, 16ms latency
```

**Test 2: With Cluster**
```bash
# On server
node server-with-cluster.js

# Output:
# Primary process 12345 is running
# Worker 12346 running on port 4400
# Worker 12347 running on port 4400
# Worker 12348 running on port 4400
# Worker 12349 running on port 4400

# On generator
autocannon -c 30 -d 10 http://<server-ip>:4400
# Result: ~6,534 req/sec, 4ms latency
```

---

## Best Practices

### 1. Number of Workers

**Recommendation:** Use N-1 workers (one less than CPU cores)

```javascript
// Good: Leave one core for system
const numWorkers = os.availableParallelism() - 1;

for (let i = 0; i < numWorkers; i++) {
  cluster.fork();
}
```

**Why N-1?**
- OS needs CPU resources
- Other processes need headroom
- Better overall stability

### 2. Worker Restart on Crash

```javascript
cluster.on('exit', (worker, code, signal) => {
  console.log(`Worker ${worker.process.pid} died`);
  
  // Restart worker
  console.log('Starting a new worker');
  cluster.fork();
});
```

### 3. Graceful Shutdown

```javascript
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing workers...');
  
  for (const id in cluster.workers) {
    cluster.workers[id].kill();
  }
  
  process.exit(0);
});
```

### 4. Health Checks

```javascript
if (cluster.isPrimary) {
  // Monitor worker health
  setInterval(() => {
    for (const id in cluster.workers) {
      const worker = cluster.workers[id];
      if (!worker.isConnected()) {
        console.log(`Worker ${id} is disconnected, restarting...`);
        worker.kill();
        cluster.fork();
      }
    }
  }, 5000);
}
```

### 5. Memory Monitoring

```javascript
if (!cluster.isPrimary) {
  setInterval(() => {
    const used = process.memoryUsage();
    console.log(`Worker ${process.pid} memory:`, 
      Math.round(used.heapUsed / 1024 / 1024), 'MB');
  }, 10000);
}
```

---

## Limitations & Considerations

### 1. Memory Overhead

**Problem:** Each worker has own memory space

```
Without Cluster:
Process 1: 2GB RAM

With Cluster (4 workers):
Process 1: 2GB RAM
Process 2: 2GB RAM
Process 3: 2GB RAM
Process 4: 2GB RAM
─────────────────
Total: 8GB RAM
```

**Impact:**
- Memory usage multiplies by number of workers
- Ensure server has sufficient RAM
- Monitor memory consumption

**Solution:**
```javascript
// Monitor and limit workers based on memory
const totalRAM = os.totalmem();
const freeRAM = os.freemem();
const memoryPerWorker = 2 * 1024 * 1024 * 1024; // 2GB

const maxWorkers = Math.floor(freeRAM / memoryPerWorker);
const numWorkers = Math.min(numCPUs, maxWorkers);
```

### 2. Shared State Issues

**Problem:** Workers don't share memory

```javascript
// ❌ This won't work across workers
let counter = 0;

app.get('/count', (req, res) => {
  counter++;
  res.json({ count: counter });
});
```

**Why?**
- Each worker has separate `counter`
- State is not synchronized
- Inconsistent results

**Solution:** Use external storage

```javascript
// ✅ Use Redis for shared state
import Redis from 'ioredis';
const redis = new Redis();

app.get('/count', async (req, res) => {
  const count = await redis.incr('counter');
  res.json({ count });
});
```

### 3. Session Management

**Problem:** Sessions stored in memory won't work

```javascript
// ❌ Memory sessions won't work
app.use(session({
  store: new MemoryStore(),
  secret: 'secret'
}));
```

**Solution:** Use Redis session store

```javascript
// ✅ Use Redis for sessions
import connectRedis from 'connect-redis';
import Redis from 'ioredis';

const RedisStore = connectRedis(session);
const redis = new Redis();

app.use(session({
  store: new RedisStore({ client: redis }),
  secret: 'secret'
}));
```

### 4. File Uploads

**Problem:** Load balancer may route to different workers

**Solution:** Use shared storage
- AWS S3
- Shared file system
- Database

### 5. WebSockets

**Problem:** Sticky sessions needed for WebSocket connections

**Solution:** Use PM2 or configure sticky sessions manually

---

## Alternative Solutions

### 1. PM2 Process Manager

**Benefits:**
- Handles clustering automatically
- Built-in monitoring
- Auto-restart on crash
- Log management
- Zero-downtime deployments

```bash
npm install -g pm2

# Start with cluster mode
pm2 start app.js -i max

# Max = number of CPU cores
```

**pm2 ecosystem file:**

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'my-app',
    script: './server.js',
    instances: 'max',  // or specific number
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

### 2. Worker Threads

**When to use:**
- Same process, multiple threads
- Shared memory needed
- CPU-intensive calculations
- Don't need process isolation

```javascript
import { Worker } from 'worker_threads';

const worker = new Worker('./worker.js');
```

**Cluster vs Worker Threads:**

| Feature | Cluster | Worker Threads |
|---------|---------|----------------|
| Process | Multiple | Single |
| Memory | Separate | Shared |
| Communication | IPC | Shared memory |
| Use Case | Full app duplication | CPU tasks |

---

## Complete Code Examples

### Basic Implementation

```javascript
// server-basic-cluster.js
import cluster from 'cluster';
import os from 'os';
import express from 'express';

const PORT = 4400;
const numCPUs = os.availableParallelism();

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
  
} else {
  const app = express();
  
  app.get('/', (req, res) => {
    res.json({
      message: 'Hello from cluster',
      worker: process.pid
    });
  });
  
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} started`);
  });
}
```

### Production-Ready Implementation

```javascript
// server-production-cluster.js
import cluster from 'cluster';
import os from 'os';
import express from 'express';

const PORT = process.env.PORT || 4400;
const numCPUs = os.availableParallelism();
const numWorkers = process.env.WORKERS || numCPUs - 1;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} starting...`);
  console.log(`Forking ${numWorkers} workers`);
  
  // Fork workers
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }
  
  // Worker exit handler
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died (${signal || code})`);
    
    // Restart worker
    if (!worker.exitedAfterDisconnect) {
      console.log('Starting replacement worker');
      cluster.fork();
    }
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
  });
  
  // Health monitoring
  setInterval(() => {
    const workerCount = Object.keys(cluster.workers).length;
    console.log(`Active workers: ${workerCount}`);
  }, 30000);
  
} else {
  const app = express();
  
  // Middleware
  app.use(express.json());
  
  // Routes
  app.get('/', (req, res) => {
    res.json({
      message: 'Server running',
      worker: process.pid,
      uptime: process.uptime()
    });
  });
  
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      worker: process.pid,
      memory: process.memoryUsage()
    });
  });
  
  app.get('/heavy', (req, res) => {
    // Simulate CPU-intensive task
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += i;
    }
    res.json({ sum, worker: process.pid });
  });
  
  // Error handling
  app.use((err, req, res, next) => {
    console.error(`Error in worker ${process.pid}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  });
  
  // Start server
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} listening on port ${PORT}`);
  });
  
  // Graceful shutdown for workers
  process.on('SIGTERM', () => {
    console.log(`Worker ${process.pid} shutting down`);
    process.exit(0);
  });
}
```

---

## Monitoring & Debugging

### Log Worker Activity

```javascript
if (cluster.isPrimary) {
  cluster.on('online', (worker) => {
    console.log(`Worker ${worker.process.pid} is online`);
  });
  
  cluster.on('disconnect', (worker) => {
    console.log(`Worker ${worker.process.pid} disconnected`);
  });
  
  cluster.on('listening', (worker, address) => {
    console.log(`Worker ${worker.process.pid} listening on ${address.port}`);
  });
}
```

### Monitor Memory Usage

```javascript
if (!cluster.isPrimary) {
  setInterval(() => {
    const mem = process.memoryUsage();
    console.log(`Worker ${process.pid} memory:`, {
      rss: Math.round(mem.rss / 1024 / 1024) + 'MB',
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024) + 'MB'
    });
  }, 10000);
}
```

---

## Performance Comparison Summary

### Local Machine (10 CPU Cores)

| Metric | Without Cluster | With Cluster | Improvement |
|--------|-----------------|--------------|-------------|
| Requests/sec | 6,352 | 19,150 | **3x** |
| Latency (avg) | 4.28ms | 1.0ms | **4x faster** |
| CPU Usage | ~10% | ~100% | **10x utilization** |

### AWS EC2 (4 vCPUs)

| Metric | Without Cluster | With Cluster | Improvement |
|--------|-----------------|--------------|-------------|
| Requests/sec | 1,762 | 6,534 | **3.7x** |
| Latency (avg) | 16ms | 4ms | **4x faster** |
| CPU Usage | ~25% | ~100% | **4x utilization** |

---

## Quick Start Checklist

- [ ] Install Node.js (v16+)
- [ ] Create Express server
- [ ] Add cluster module
- [ ] Test locally
- [ ] Run load tests
- [ ] Deploy to production
- [ ] Monitor performance
- [ ] Configure auto-restart
- [ ] Set up logging
- [ ] Monitor memory usage

---

## Common Issues & Solutions

### Issue 1: Port Already in Use

**Problem:**
```
Error: listen EADDRINUSE: address already in use :::4400
```

**Solution:** All workers listen on same port (this is correct!)
```javascript
// This is normal - cluster handles it
app.listen(PORT); // All workers use same port
```

### Issue 2: Workers Keep Dying

**Cause:** Memory leak or unhandled errors

**Solution:**
```javascript
// Add error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});
```

### Issue 3: Inconsistent State

**Problem:** Counter, sessions not working

**Solution:** Use Redis for shared state
```javascript
import Redis from 'ioredis';
const redis = new Redis();
```

---

## Key Takeaways

### What We Learned

1. **Node.js is single-threaded** - uses only one CPU core by default
2. **Cluster module** enables full CPU utilization
3. **3-4x performance improvement** is achievable
4. **Built-in load balancing** - no external tools needed
5. **Memory multiplies** with workers - plan accordingly

### When to Use Cluster

✅ **Use Cluster When:**
- CPU-bound operations
- High traffic applications
- Multiple CPU cores available
- Need horizontal scaling

❌ **Don't Use Cluster When:**
- I/O-bound operations (already async)
- Single CPU core
- Heavy memory usage per process
- Need shared state

### Production Recommendations

1. Use **PM2** for easier management
2. **Monitor** memory usage carefully
3. Use **N-1** workers (leave one core free)
4. Implement **graceful shutdown**
5. Use **Redis** for shared state
6. Set up **health checks**
7. Configure **auto-restart** on crashes

---

## Further Resources

- **Node.js Cluster Docs:** https://nodejs.org/api/cluster.html
- **PM2 Documentation:** https://pm2.keymetrics.io/
- **AutoCannon:** https://github.com/mcollina/autocannon
- **Worker Threads:** https://nodejs.org/api/worker_threads.html

---

## Conclusion

The Cluster Module is a **powerful** but often **underutilized** feature of Node.js that can dramatically improve your application's performance.

### Remember:

> "If you have a 4-core server but only one Node.js process, you're paying for 4 cores but using only 1."

### The Golden Rule:

**Always use cluster mode in production** unless you have a specific reason not to.

---

**Source:** Codsज्ञान Channel by Rakesh  
**Test Environment:** AWS EC2, Local Development  
**Tools Used:** AutoCannon, Express.js, Node.js Cluster Module