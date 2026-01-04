# REST API Security Best Practices Guide

## Overview
This guide covers 5 essential security practices to secure your REST APIs. As beginners, we often don't know how to properly secure our applications. These are the must-follow practices that significantly improve your API security.

**Note**: These are the 5 most critical practices, but security is not limited to just these. More security topics will be covered in future content.

---

## 1. Input Validation

### Why It's Critical
Input validation might seem simple, but it's often missed and can cause serious issues. Many developers rely only on client-side validation, which can be easily bypassed.

### The Problem
```
┌─────────────┐         ┌─────────────┐
│  Frontend   │────────▶│   Backend   │
│  (Client)   │         │   (Server)  │
└─────────────┘         └─────────────┘
     Form:
   - Name
   - Email  
   - Password
```

**Never trust the client!** Implement **Zero Trust** principle.

### Common Issues Without Validation
- **Runtime errors**: Application crashes when accessing undefined properties
- **Inconsistent data**: Invalid data stored in database
- **Security vulnerabilities**: Malicious input can exploit your system

### Implementation

#### Validate as Early as Possible
Validation should happen **before** data reaches your controller. Use middleware to validate incoming requests.

```javascript
// ❌ BAD - No validation
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  // Direct use without validation - DANGEROUS!
});

// ✅ GOOD - Validate in middleware
app.post('/register', validateInput, registerController);
```

#### Example: Express.js Implementation
```javascript
// Controller
const register = (req, res) => {
  const { name, email, password } = req.body;
  
  // Validate all fields
  if (!name || !email || !password) {
    return res.status(400).json({
      error: "All fields are required"
    });
  }
  
  // Additional validation
  if (!isValidEmail(email)) {
    return res.status(400).json({
      error: "Invalid email format"
    });
  }
  
  // Process registration...
};
```

### Recommended Validation Libraries
- **Zod** (Modern, TypeScript-first)
- **express-validator**
- **Joi**
- **Yup**

### Best Practices
✅ Validate on **both** client and server side
✅ Return **400 Bad Request** for invalid input with clear error messages
✅ Check data types, formats, and constraints
✅ Validate email formats, password strength
✅ Use middleware for centralized validation
❌ **Never skip server-side validation**

---

## 2. Rate Limiting

### What is Rate Limiting?
Rate limiting restricts the number of requests a client can make within a time window, protecting your server from overload and attacks.

### Why It's Needed

#### Scenario
```
Server capacity: 100 requests/second

If 100+ requests arrive simultaneously:
→ Server may crash
→ Service becomes unavailable
```

#### Protection Against
- **Server overload**: Prevents crashes from too many requests
- **DDoS attacks**: Protects against Distributed Denial of Service attacks
- **Brute force attacks**: Limits login attempts
- **Accidental loops**: Protects against frontend infinite loops

### Implementation Concept
```
┌─────────────┐         ┌──────────────────┐
│  Frontend   │────────▶│  Rate Limiter    │
│  (IP: X)    │         │  Max: 10/minute  │
└─────────────┘         └──────────────────┘
                                │
                        Request #11 → Rejected!
                        (Status: 429 Too Many Requests)
```

### Express.js Implementation

#### Install Package
```bash
npm install express-rate-limit
```

#### Global Rate Limiter (All Routes)
```javascript
const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window per IP
  message: "Too many requests, please try again later",
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  handler: (req, res) => {
    // Log the violation
    console.log(`Rate limit exceeded for IP: ${req.ip}`);
    // Send notification if needed
    res.status(429).json({
      error: "Too many requests"
    });
  }
});

// Apply to all routes
app.use(globalLimiter);
```

#### Specific Route Limiters (Stricter)
```javascript
// Auth limiter - stricter for login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 attempts
  message: "Too many authentication attempts"
});

// Password reset limiter - very strict
const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3, // Only 3 attempts
  message: "Too many password reset attempts"
});

// Apply to specific routes
app.post('/login', authLimiter, loginController);
app.post('/register', authLimiter, registerController);
app.post('/reset-password', passwordLimiter, resetController);
```

### Response Headers
```http
RateLimit-Policy: 5
RateLimit-Limit: 5
RateLimit-Remaining: 3
RateLimit-Reset: 893
```

### HTTP Status Code
**429 Too Many Requests** - Standard status code for rate limiting

### Best Practices
✅ Apply global limiter for all routes
✅ Use stricter limits for authentication endpoints
✅ Set appropriate window sizes (15 min, 1 hour, 1 day)
✅ Log rate limit violations
✅ Send notification alerts for suspicious activity
✅ Return clear error messages to users

---

## 3. Protect APIs with Authentication

### The Problem
```
┌─────────────┐         ┌─────────────────────┐
│  Frontend   │────────▶│  /api/profile       │
│             │         │  (Personal data)    │
└─────────────┘         └─────────────────────┘
```

Without protection, anyone can access personal data by hitting the URL directly.

### Solution: Authentication
Use tokens to verify that requests come from authenticated users.

### Implementation Flow
```
1. User logs in → Server generates token
2. Server returns token to client
3. Client stores token (localStorage, cookies)
4. Client sends token with every request
5. Server validates token before processing
```

### JWT (JSON Web Tokens) Approach

#### Login - Generate Token
```javascript
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { email, password } = req.body;
  
  // Verify credentials
  const user = await User.findByEmail(email);
  if (!user || !user.verifyPassword(password)) {
    return res.status(401).json({
      error: "Invalid credentials"
    });
  }
  
  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' } // Token expires in 1 hour
  );
  
  res.json({ 
    token,
    user: { id: user.id, email: user.email }
  });
};
```

#### Protect Routes - Verify Token
```javascript
const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: "No token provided"
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request
    req.user = decoded;
    
    // Continue to next middleware/controller
    next();
    
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired token"
    });
  }
};

// Protected route
app.get('/api/profile', authMiddleware, getProfile);
```

#### Client-Side Usage
```javascript
// Store token after login
localStorage.setItem('token', token);

// Send token with requests
fetch('/api/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### HTTP Status Codes
- **401 Unauthorized** - No token or invalid token
- **403 Forbidden** - Valid token but insufficient permissions

### Best Practices
✅ Use short token expiry (1 hour or less)
✅ Implement refresh tokens for seamless user experience
✅ Use token rotation for enhanced security
✅ Store tokens securely (httpOnly cookies preferred over localStorage)
✅ Validate tokens in middleware before controller
✅ Never expose sensitive data without authentication
❌ Don't store sensitive data in tokens

### Additional Resources
- JWT Deep Dive (video linked)
- Refresh Token Implementation (video linked)
- Token Rotation Strategies (video linked)

---

## 4. Error Handling

### Why Error Handling is Security
Error handling isn't just about stability—it's a security concern:
- **Application crashes** expose vulnerabilities
- **Poor error messages** leak sensitive information
- **Unhandled errors** cause service downtime
- **Downtime** = Revenue loss in production

### Implementation Strategy

#### 1. Global Error Handler
Centralize error handling in one place to catch all application errors.

```javascript
// Global error handler middleware (at the end)
app.use((err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err);
  
  // Determine environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Send appropriate response
  res.status(err.statusCode || 500).json({
    error: isDevelopment ? err.message : 'Internal Server Error',
    // Don't expose stack traces in production
    ...(isDevelopment && { stack: err.stack })
  });
});
```

#### 2. Never Expose Production Errors to Client
```javascript
// ❌ BAD - Exposes internal details
app.get('/users', async (req, res) => {
  try {
    const users = await db.query('SELECT * FROM users');
    res.json(users);
  } catch (error) {
    // Exposing database errors!
    res.status(500).json({ error: error.message });
  }
});

// ✅ GOOD - Generic user-friendly message
app.get('/users', async (req, res) => {
  try {
    const users = await db.query('SELECT * FROM users');
    res.json(users);
  } catch (error) {
    // Log error internally
    logger.error('Database error:', error);
    
    // Send generic message to client
    res.status(500).json({ 
      error: 'Unable to fetch users. Please try again later.'
    });
  }
});
```

#### 3. Log All Errors
```javascript
// Use proper logging service
const logger = require('./logger'); // Winston, Pino, etc.

app.use((err, req, res, next) => {
  // Log with context
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  
  res.status(500).json({
    error: 'An error occurred'
  });
});
```

### Logging Destinations
- **External Services**: Elasticsearch, LogStash
- **File System**: Log files on server
- **Cloud Services**: CloudWatch, Datadog, Sentry
- **Monitoring Tools**: Grafana, Kibana

### Best Practices
✅ Implement global error handler
✅ Never expose internal errors to clients
✅ Use generic, user-friendly error messages
✅ Log all errors with context for debugging
✅ Use proper logging libraries (Winston, Pino)
✅ Monitor error logs regularly
✅ Set up alerts for critical errors
❌ Don't expose stack traces in production
❌ Don't log sensitive data (passwords, tokens)

---

## 5. HTTPS (Encryption in Transit)

### The Problem with HTTP
```
┌─────────────┐         ┌─────────────┐
│  Frontend   │────────▶│   Backend   │
│             │  HTTP   │   Port 80   │
└─────────────┘         └─────────────┘
        │
        ├─ Data sent as PLAIN TEXT
        ├─ Username: john@example.com
        └─ Password: mypassword123
        
   ⚠️ Anyone in the middle can read this!
```

### Solution: HTTPS with TLS/SSL
```
┌─────────────┐         ┌─────────────┐
│  Frontend   │────────▶│   Backend   │
│             │  HTTPS  │   Port 443  │
└─────────────┘         └─────────────┘
        │
        ├─ Data is ENCRYPTED
        ├─ jk3n4l5m6o7p8q9r0s...
        └─ Unreadable without decryption key
```

### How HTTPS Works
1. **TLS/SSL Certificates** are installed on server
2. Certificates contain encryption keys
3. Client and server perform **TLS handshake**
4. All data is encrypted during transmission
5. Only client and server can decrypt the data

### Implementation Methods

#### Method 1: Direct on Backend Server
```javascript
// Node.js HTTPS server
const https = require('https');
const fs = require('fs');
const express = require('express');

const app = express();

const options = {
  key: fs.readFileSync('/path/to/private-key.pem'),
  cert: fs.readFileSync('/path/to/certificate.pem')
};

https.createServer(options, app).listen(443, () => {
  console.log('HTTPS server running on port 443');
});
```

**Certificate Sources**:
- **Let's Encrypt** (Free) - Recommended
- **Commercial CAs** (Paid) - DigiCert, GlobalSign

#### Method 2: Reverse Proxy (Recommended)
```
┌──────────┐         ┌───────────────┐         ┌──────────┐
│ Frontend │────────▶│ Reverse Proxy │────────▶│ Backend  │
│          │  HTTPS  │   (Port 443)  │  HTTP  │ Server   │
└──────────┘         └───────────────┘         └──────────┘
                     (Nginx/Caddy)
                     SSL Certificate here
```

**Benefits**:
- Centralized SSL management
- Easier to scale multiple backend servers
- SSL termination at proxy level
- Backend can remain HTTP

#### Nginx Configuration
```nginx
server {
    listen 443 ssl;
    server_name example.com;
    
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Method 3: Caddy (Auto-HTTPS)
```
Caddy automatically handles SSL certificates!
No manual certificate setup needed.
```

**Caddyfile**:
```
example.com {
    reverse_proxy localhost:3000
}
```

Caddy automatically:
- Obtains SSL certificates from Let's Encrypt
- Renews certificates before expiration
- Redirects HTTP to HTTPS
- Sets up HTTPS with best practices

#### Method 4: Cloud Services
- **Cloudflare**: CDN + SSL included
- **AWS Certificate Manager**: Free SSL for AWS
- **Netlify/Vercel**: Automatic HTTPS for frontend

### Certificate Types
- **Domain Validated (DV)**: Basic, free (Let's Encrypt)
- **Organization Validated (OV)**: Paid, verified business
- **Extended Validation (EV)**: Highest level, green address bar

### Best Practices
✅ Always use HTTPS in production
✅ Use Let's Encrypt for free SSL certificates
✅ Set up automatic certificate renewal
✅ Redirect HTTP to HTTPS
✅ Use reverse proxy for centralized SSL management
✅ Keep certificates up to date
✅ Use strong TLS versions (TLS 1.2+)
✅ Disable weak ciphers
❌ Never use HTTP for sensitive data
❌ Don't ignore certificate expiration

### Port Numbers
- **HTTP**: Port 80 (Unencrypted)
- **HTTPS**: Port 443 (Encrypted with TLS/SSL)

---

## Complete Security Checklist

### Must Implement
- [ ] Input validation on all endpoints
- [ ] Rate limiting (global + route-specific)
- [ ] JWT authentication for protected routes
- [ ] Global error handler
- [ ] HTTPS with valid SSL certificates

### Additional Security Layers
- [ ] CORS configuration
- [ ] Helmet.js for HTTP headers
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Content Security Policy
- [ ] Security headers
- [ ] API versioning
- [ ] Request logging
- [ ] Monitoring and alerts

## Technology Stack Examples

### Node.js/Express.js
```javascript
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes with authentication
app.use('/api', authMiddleware, routes);

// Global error handler
app.use(errorHandler);
```

### Libraries and Tools
- **Validation**: Zod, Joi, express-validator
- **Rate Limiting**: express-rate-limit
- **Authentication**: jsonwebtoken, passport
- **Logging**: Winston, Pino, Morgan
- **Security**: Helmet.js
- **SSL**: Let's Encrypt, Certbot
- **Reverse Proxy**: Nginx, Caddy
- **Monitoring**: Sentry, Datadog, New Relic

## Language Agnostic
These security practices apply to **all backend languages**:
- Node.js/Express
- Python/Django/Flask
- Go
- Java/Spring Boot
- PHP/Laravel
- Ruby/Rails

## Summary

| Practice | Priority | Impact |
|----------|----------|--------|
| Input Validation | ⭐⭐⭐ Critical | Prevents crashes, data corruption, SQL injection |
| Rate Limiting | ⭐⭐⭐ Critical | Prevents DDoS, brute force attacks |
| Authentication | ⭐⭐⭐ Critical | Protects sensitive data and endpoints |
| Error Handling | ⭐⭐ High | Prevents info leakage, ensures stability |
| HTTPS | ⭐⭐⭐ Critical | Encrypts data in transit |

**Key Takeaway**: Security is not optional. Implement all 5 practices in every project. These are minimum requirements for production applications!

---

## Additional Resources
- Error Handling Deep Dive (video linked)
- JWT Authentication Tutorial (video linked)
- Refresh Token Implementation (video linked)
- Nginx Load Balancing (video linked)
- Caddy Server Tutorial (video linked)
- Reverse Proxy Explained (video linked)

## Contributing
Found an issue or want to add more security practices? Feel free to contribute!

## License
This guide is for educational purposes.