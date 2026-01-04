# JWT Authentication: Complete Guide

## Overview
A comprehensive guide to JSON Web Tokens (JWT) and how they enable scalable authentication systems. This guide covers everything from basic concepts to advanced security patterns.

---

## Table of Contents
1. [Introduction to Authentication](#introduction-to-authentication)
2. [Stateful vs Stateless Authentication](#stateful-vs-stateless-authentication)
3. [What is JWT?](#what-is-jwt)
4. [JWT Structure & Anatomy](#jwt-structure--anatomy)
5. [How JWT Works](#how-jwt-works)
6. [Security Considerations](#security-considerations)
7. [Advanced Patterns](#advanced-patterns)

---

## Introduction to Authentication

### What is Authentication?
Authentication is the process of verifying user identity, typically through login/logout operations.

### Example: YouTube
- **Without Login**: Watch videos
- **With Login**: Like, comment, subscribe
- Login required for protected actions

---

## Stateful vs Stateless Authentication

### 1. Stateful Authentication (Session-Based)

#### How It Works
```
Browser → Login (username/password) → Server
         ↓
    Verify in Database
         ↓
    Generate Session ID → Store on Server
         ↓
    Send Session ID in Cookie → Browser
         ↓
    Future Requests: Send Session ID
         ↓
    Server Checks Session ID → Return Data
```

#### Flow Details
1. User sends username/password
2. Server verifies credentials in database
3. Server generates random session ID
4. Session ID stored on server (memory/file/database)
5. Session ID sent to browser via cookie
6. Browser includes session ID in future requests
7. Server validates session ID for each request

#### Problems with Stateful Authentication

**1. Server Restart Issues**
- Sessions stored in memory are wiped on restart
- All users logged out unexpectedly
- Poor user experience

**2. Horizontal Scaling Complexity**
```
User → Load Balancer → Server 1 (has session)
                    → Server 2 (no session) ❌
                    → Server 3 (no session) ❌
```
- Session stored on one server only
- Requests to other servers fail
- **Solution**: Sticky sessions (route same IP to same server)
- **Problem**: Adds complexity

**3. Session Storage Requirements**
- Must maintain large session store
- Requires fast database (Redis, Memcached)
- In-memory databases are expensive
- Need to scale session store separately

### 2. Stateless Authentication (JWT-Based)

#### How It Works
```
Browser → Login (username/password) → Server
         ↓
    Verify in Database
         ↓
    Generate JWT Token
         ↓
    Sign Token with Secret Key
         ↓
    Send JWT to Browser
         ↓
    Future Requests: Send JWT
         ↓
    Server Verifies JWT → Return Data
```

#### Key Differences
- **No server-side storage** of tokens
- Token stored only in browser
- Server only generates and verifies
- No state maintained on server

#### Advantages

**1. No Server State**
- No session storage needed
- No expensive in-memory databases
- Reduced server memory usage

**2. Easy Horizontal Scaling**
```
User → Load Balancer → Server 1 ✓
                    → Server 2 ✓
                    → Server 3 ✓
```
- All servers can verify tokens
- Just need same secret key on all servers
- No sticky sessions required

**3. Simplified Architecture**
- Less infrastructure to manage
- No session synchronization
- Clean separation of concerns

---

## What is JWT?

### Definition
**JSON Web Token (JWT)** is an open standard (RFC 7519) for securely transmitting information between parties as a JSON object.

### Key Characteristics
- **Compact**: URL-safe string format
- **Self-contained**: Contains all necessary information
- **Digitally signed**: Ensures integrity and authenticity
- **Stateless**: No server-side storage required

### Use Cases
1. **Authentication/Authorization**: Most common use
2. **Information Exchange**: Secure data transmission between parties

### Standard Reference
- RFC 7519: [https://tools.ietf.org/html/rfc7519](https://tools.ietf.org/html/rfc7519)
- Official Site: [https://jwt.io](https://jwt.io)

---

## JWT Structure & Anatomy

### Format
```
header.payload.signature
```

A JWT consists of three parts separated by dots (`.`)

### Visual Representation
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9  ← Header (Green)
.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4ifQ  ← Payload (White)
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  ← Signature (Indigo)
```

### 1. Header

Contains metadata about the token:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

- **alg**: Signing algorithm (HS256, RS256, etc.)
- **typ**: Token type (JWT)

**Encoding**: Base64URL encoded

### 2. Payload (Claims)

Contains the actual data:

```json
{
  "sub": "user-id-123",
  "email": "user@example.com",
  "iat": 1516239022,
  "exp": 1516242622
}
```

#### Standard Claims
- **sub** (Subject): User ID
- **iat** (Issued At): Token creation timestamp
- **exp** (Expiration): Token expiry timestamp

#### Private Claims
Custom data you add:
- Email
- Role (admin, user, etc.)
- Permissions

**⚠️ Warning**: Never store sensitive data (passwords, API keys) in payload - it's readable!

**Encoding**: Base64URL encoded

### 3. Signature

Ensures token integrity:

```javascript
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

#### Generation Process
1. Take Base64-encoded header
2. Add dot separator (`.`)
3. Add Base64-encoded payload
4. Apply HMAC-SHA256 with secret key
5. Result is the signature

#### Purpose
- Verify token hasn't been tampered with
- Confirm token was issued by trusted source
- Validate token authenticity

---

## How JWT Works

### Complete Authentication Flow

#### 1. Login & Token Generation

```
Client                          Server                      Database
  |                               |                             |
  |--Login (user/pass)---------->|                             |
  |                               |--Check credentials-------->|
  |                               |<--Valid--------------------|
  |                               |                             |
  |                        Generate JWT                         |
  |                        Sign with Secret                     |
  |                               |                             |
  |<--Send JWT Token--------------|                             |
  |  (Store in browser)           |                             |
```

#### 2. Accessing Protected Resources

```
Client                          Server                      Database
  |                               |                             |
  |--Request + JWT-------------->|                             |
  |                        Verify JWT                           |
  |                        Check Signature                      |
  |                        Check Expiry                         |
  |                               |                             |
  |                               |--Fetch data--------------->|
  |                               |<--Data---------------------|
  |<--Protected Data--------------|                             |
```

### Verification Process

Server verifies:
1. **Signature Match**: Token hasn't been modified
2. **Expiration**: Token is still valid
3. **Issuer**: Token from trusted source (optional)

### Example: Base64 Encoding

```javascript
// Browser Console
btoa("Hi") // "SGk="

btoa(JSON.stringify({name: "Rakesh"})) 
// "eyJuYW1lIjoiUmFrZXNoIn0="

// Decode
atob("eyJuYW1lIjoiUmFrZXNoIn0=")
// '{"name":"Rakesh"}'
```

---

## Security Considerations

### Why is JWT Secure if Readable?

#### Key Point: Integrity, Not Secrecy
- Anyone can **read** JWT (Base64 decoded)
- Nobody can **modify** JWT without detection
- Signature verification detects tampering

#### How Tamper Protection Works

```javascript
// Original JWT
header + payload + signature
// Signature based on: header + payload + secret

// If someone changes payload:
modified_payload 
// Old signature won't match!
// Verification fails ❌
```

#### Example: Attempted Tampering

```json
// Original
{"admin": false}

// Attacker changes to:
{"admin": true}

// Result:
// - New payload creates different signature
// - Server verification fails
// - Request rejected
```

**Even changing 1 character invalidates the signature!**

### Token Theft Problem

#### Scenario
If JWT is stolen from browser:
- Attacker can make authenticated requests
- Acts as the legitimate user
- Major security risk

#### Solution: Short Expiration

**Strategy**: Set short expiration time

```json
{
  "exp": 1516242622  // Expires in 5 minutes
}
```

**Trade-off**:
- ✅ Stolen token valid for limited time only
- ❌ User must re-login frequently
- ❌ Poor user experience

---

## Advanced Patterns

### 1. Access Token + Refresh Token Pattern

#### The Problem
- Short expiration = Secure ✓
- Short expiration = Frequent logins = Bad UX ✗

#### The Solution
Use **two tokens** with different lifespans:

```
Access Token:  Short-lived (60 seconds)
Refresh Token: Long-lived (1 year)
```

#### Architecture

```
┌─────────────────────────────────────────────────────┐
│ Client (Browser)                                    │
│  - Access Token (60s)                               │
│  - Refresh Token (1 year)                           │
└─────────────────────────────────────────────────────┘
              │
              │ Request + Access Token
              ▼
┌─────────────────────────────────────────────────────┐
│ Server                                              │
│  1. Verify Access Token                             │
│  2. If expired → 401 Response                       │
└─────────────────────────────────────────────────────┘
              │
              │ 401 Received
              ▼
┌─────────────────────────────────────────────────────┐
│ Client (Frontend)                                   │
│  1. Intercept 401                                   │
│  2. Send Refresh Token                              │
└─────────────────────────────────────────────────────┘
              │
              │ Refresh Token
              ▼
┌─────────────────────────────────────────────────────┐
│ Server                                              │
│  1. Verify Refresh Token                            │
│  2. Generate New Access Token                       │
│  3. Return New Access Token                         │
└─────────────────────────────────────────────────────┘
              │
              │ Retry Original Request
              ▼
        Success! ✓
```

#### Detailed Flow

**Step 1: Initial Login**
```
1. User logs in
2. Server generates:
   - Access Token (exp: 60s)
   - Refresh Token (exp: 1 year)
3. Both sent to browser
4. Both stored in browser
```

**Step 2: Making Requests**
```
1. Send Access Token with request
2. If valid → Get data ✓
3. If expired (401) → Go to Step 3
```

**Step 3: Auto-Refresh (Behind the Scenes)**
```
1. Frontend intercepts 401 error
2. Automatically sends Refresh Token
3. Server verifies Refresh Token
4. Server generates new Access Token
5. Frontend retries original request with new token
6. User gets data (seamless experience)
```

#### Benefits
- ✅ High security (short-lived access tokens)
- ✅ Good UX (seamless refresh)
- ✅ User stays logged in
- ✅ Automatic token renewal

### 2. Refresh Token Security

#### Problem
What if Refresh Token is stolen?
- Long validity (1 year)
- Can generate unlimited Access Tokens
- Major security risk

#### Solution 1: Database Storage

**Store Refresh Tokens in Database**

```
┌─────────────────────────────────────┐
│ Users Table                         │
├─────────────────────────────────────┤
│ id  │ email        │ refresh_token  │
│ 1   │ user@x.com   │ abc123...      │
└─────────────────────────────────────┘
```

**Benefits**:
- Can invalidate tokens on logout
- Can revoke compromised tokens
- Track active sessions

**Process**:
```
1. User logs out
2. Delete refresh token from database
3. Stolen token becomes invalid
4. Cannot generate new access tokens
```

**Note**: Can use regular database (not Redis) since refresh happens infrequently

#### Solution 2: Token Rotation

**Concept**: Generate new Refresh Token on each refresh

```
Request 1:
  Send: Refresh Token A
  Receive: Access Token + Refresh Token B
  
Request 2:
  Send: Refresh Token B (A now invalid)
  Receive: Access Token + Refresh Token C
  
Request 3:
  Send: Refresh Token C (B now invalid)
  Receive: Access Token + Refresh Token D
```

#### Complete Flow with Rotation

```
1. Access Token expires (60s)
   ↓
2. Frontend sends Refresh Token A
   ↓
3. Server:
   - Verifies Token A
   - Generates new Access Token
   - Generates new Refresh Token B
   - Invalidates Token A in database
   ↓
4. Browser receives:
   - New Access Token
   - New Refresh Token B
   ↓
5. Old Token A can't be reused
```

#### Benefits of Rotation
- Limits stolen token lifetime
- Each token used only once
- Automatic rotation every 60s
- Combined with short access token expiry
- Significantly reduces attack window

### 3. Hybrid Approach (Maximum Security)

**Combine Multiple Strategies**:

```
Layer 1: Short-lived Access Tokens (60s)
Layer 2: Refresh Tokens with rotation
Layer 3: Database storage of Refresh Tokens
Layer 4: Token blacklisting on logout
Layer 5: (Optional) Session tracking
```

#### Security Layers Philosophy

**Key Principle**: No authentication method is bulletproof

**Strategy**: Add multiple security layers
- Each layer reduces risk
- Makes attacks progressively harder
- Defense in depth approach

**Example Progression**:
1. Basic: Access Token → Problem: If stolen, valid until expiry
2. + Short expiry → Problem: Bad UX
3. + Refresh Token → Problem: Refresh can be stolen
4. + Database storage → Problem: Must logout manually
5. + Token rotation → Problem: Still small window
6. + Hybrid with sessions → More secure, more complex

**Goal**: Make security cracking increasingly difficult, not impossible

---

## Comparison Table

| Feature | Stateful (Session) | Stateless (JWT) |
|---------|-------------------|-----------------|
| **Server Storage** | Required | Not required |
| **Scalability** | Complex (sticky sessions) | Simple |
| **Memory Usage** | High (session store) | Low |
| **Database** | Fast DB needed (Redis) | Optional (for refresh) |
| **Security** | Server controls all | Token-based |
| **Logout** | Delete session | Token expiry/blacklist |
| **Complexity** | Higher infrastructure | Lower infrastructure |
| **Best For** | Smaller apps | Large-scale apps |

---

## Algorithms

### Symmetric (HS256)
- **HMAC SHA-256**
- Single secret key
- Same key for signing and verification
- Simpler implementation
- Both parties need secret key

```javascript
// Sign
HMACSHA256(data, secret)

// Verify (same secret)
HMACSHA256(data, secret) === signature
```

### Asymmetric (RS256)
- **RSA SHA-256**
- Public/private key pair
- Private key for signing
- Public key for verification
- More secure for distributed systems
- Can share public key safely

```javascript
// Sign (server has private key)
RSASHA256(data, privateKey)

// Verify (anyone with public key)
RSASHA256(data, publicKey) === signature
```

---

## Implementation Example (Node.js)

### Basic JWT Generation

```javascript
const jwt = require('jsonwebtoken');

// Secret key
const SECRET = 'super-secret-key';

// Generate JWT
const token = jwt.sign(
  {
    sub: 'user-123',
    email: 'user@example.com',
    role: 'admin'
  },
  SECRET,
  { 
    expiresIn: '60s',  // 60 seconds
    algorithm: 'HS256'
  }
);

// Verify JWT
try {
  const decoded = jwt.verify(token, SECRET);
  console.log(decoded);
  // { sub: 'user-123', email: 'user@example.com', ... }
} catch (error) {
  console.error('Invalid token');
}
```

### With Refresh Token

```javascript
// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Verify credentials
  const user = await verifyCredentials(username, password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Generate Access Token (short-lived)
  const accessToken = jwt.sign(
    { sub: user.id, email: user.email },
    ACCESS_SECRET,
    { expiresIn: '60s' }
  );
  
  // Generate Refresh Token (long-lived)
  const refreshToken = jwt.sign(
    { sub: user.id },
    REFRESH_SECRET,
    { expiresIn: '1y' }
  );
  
  // Store refresh token in database
  await saveRefreshToken(user.id, refreshToken);
  
  res.json({ accessToken, refreshToken });
});

// Refresh endpoint
app.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    
    // Check if token exists in database
    const isValid = await checkRefreshToken(decoded.sub, refreshToken);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    // Generate new access token
    const newAccessToken = jwt.sign(
      { sub: decoded.sub },
      ACCESS_SECRET,
      { expiresIn: '60s' }
    );
    
    // Optional: Token rotation
    const newRefreshToken = jwt.sign(
      { sub: decoded.sub },
      REFRESH_SECRET,
      { expiresIn: '1y' }
    );
    
    // Update database
    await updateRefreshToken(decoded.sub, newRefreshToken);
    
    res.json({ 
      accessToken: newAccessToken,
      refreshToken: newRefreshToken 
    });
    
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout endpoint
app.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  
  // Delete refresh token from database
  await deleteRefreshToken(refreshToken);
  
  res.json({ message: 'Logged out' });
});
```

### Frontend Auto-Refresh

```javascript
// Axios interceptor for auto-refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and not already retried
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Get new access token
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/refresh', { refreshToken });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Update tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axios(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

---

## Best Practices

### 1. Token Storage
- ✅ HttpOnly cookies (most secure)
- ⚠️ localStorage (vulnerable to XSS)
- ⚠️ sessionStorage (vulnerable to XSS)

### 2. Expiration Times
- **Access Token**: 5-15 minutes
- **Refresh Token**: Days to months
- Adjust based on security requirements

### 3. Secret Key Management
- Use environment variables
- Never commit to version control
- Rotate keys periodically
- Use strong, random keys

### 4. HTTPS Only
- Always use HTTPS in production
- Prevents token interception
- Secure cookie transmission

### 5. Token Size
- Keep payload small
- Sent with every request
- Affects bandwidth

### 6. Claims to Avoid
- ❌ Passwords
- ❌ Credit card numbers
- ❌ API keys
- ❌ Social security numbers
- ✅ User ID, email, roles only

---

## Common Interview Questions

### 1. How does JWT ensure security if anyone can decode it?
JWT ensures **integrity**, not **secrecy**. The signature prevents tampering. If payload is modified, signature verification fails.

### 2. Why use JWT over sessions?
- Stateless (no server storage)
- Better scalability
- Works well with microservices
- Easier horizontal scaling

### 3. What happens if JWT is stolen?
- Short expiration limits damage
- Refresh token rotation reduces risk
- Logout invalidates refresh tokens
- Multi-layer security approach needed

### 4. Can you revoke a JWT?
- Not by default (stateless)
- Solutions: Token blacklist, short expiry, refresh tokens in DB

### 5. JWT vs OAuth?
- JWT: Token format
- OAuth: Authorization framework
- Often used together (OAuth uses JWT)

---

## Resources

### Tools
- [jwt.io](https://jwt.io) - Debugger and documentation
- [RFC 7519](https://tools.ietf.org/html/rfc7519) - Official specification

### Libraries
- **Node.js**: `jsonwebtoken`
- **Python**: `PyJWT`
- **Java**: `java-jwt`
- **Go**: `jwt-go`

### Further Learning
- Authentication best practices
- OAuth 2.0 integration
- Microservices authentication
- API security patterns

---

## Summary

### Key Takeaways

1. **JWT Structure**: header.payload.signature (3 parts)
2. **Purpose**: Stateless authentication at scale
3. **Security**: Signature ensures integrity, not secrecy
4. **Best Practice**: Access + Refresh token pattern
5. **Scaling**: No server state = easy horizontal scaling
6. **Trade-offs**: Security vs convenience

### When to Use JWT
- ✅ Microservices architecture
- ✅ Stateless APIs
- ✅ Mobile applications
- ✅ Single Page Applications (SPAs)
- ✅ Large-scale distributed systems

### When to Consider Sessions
- ✅ Monolithic applications
- ✅ Small user base
- ✅ Need immediate revocation
- ✅ Simpler security model preferred

---

## Conclusion

JWT authentication provides a scalable, stateless solution for modern applications. By understanding its structure, security model, and implementing proper patterns like refresh tokens and rotation, you can build secure authentication systems that scale effectively.

Remember: **Security is achieved through layers, not single solutions.** Combine multiple strategies for robust protection.