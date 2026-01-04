# Complete Guide to Web Rendering Techniques

## Overview

A comprehensive guide to understanding web rendering techniques including SSR, CSR, SSG, ISR, and ISG. Learn when to use each approach for optimal user experience, performance, and SEO.

**Source:** Codsज्ञान Channel by Rakesh  
**Topics Covered:** Static Sites, SPA, SSR, CSR, SSG, ISR, ISG, Next.js Implementation

---

## Table of Contents

1. [Evolution of Web Rendering](#evolution-of-web-rendering)
2. [Client-Side Rendering (CSR)](#client-side-rendering-csr)
3. [Server-Side Rendering (SSR)](#server-side-rendering-ssr)
4. [Static Site Generation (SSG)](#static-site-generation-ssg)
5. [Incremental Static Regeneration (ISR)](#incremental-static-regeneration-isr)
6. [Incremental Static Generation (ISG)](#incremental-static-generation-isg)
7. [Choosing the Right Technique](#choosing-the-right-technique)
8. [Next.js Implementation](#nextjs-implementation)

---

## Evolution of Web Rendering

### 1. Early Web (Pure Static)

**The Beginning:** Static HTML Files

```
┌──────────────┐          ┌──────────────┐
│  Web Server  │  ────→   │   Browser    │
│              │          │              │
│ index.html   │  ←────   │   Request    │
│ about.html   │          │              │
└──────────────┘          └──────────────┘
```

**Characteristics:**
- Pure static HTML files
- No interactivity
- No JavaScript
- Simple file serving

---

### 2. JavaScript Era

**Adding Interactivity**

```
┌──────────────┐          ┌──────────────┐
│  Web Server  │  ────→   │   Browser    │
│              │          │              │
│ index.html   │          │ + script.js  │
│ script.js    │          │ (Interactive)│
└──────────────┘          └──────────────┘
```

**Improvements:**
- JavaScript for interactivity
- Event listeners
- Button clicks
- Dynamic behavior

**Limitations:**
- Still mostly static content
- Limited dynamic data handling

---

### 3. Template Engines Era

**Dynamic Data on Server**

```
┌───────────────────┐          ┌──────────────┐
│   Web Server      │          │   Browser    │
│                   │  ────→   │              │
│ Template Engine   │          │ Rendered     │
│ (EJS, Handlebars) │          │ HTML         │
│ + Database        │          │              │
└───────────────────┘          └──────────────┘
```

**Popular Template Engines:**
- **JavaScript/Node.js:** EJS, Handlebars
- **PHP:** Blade, Twig
- **Ruby:** ERB

**Process:**
1. Browser requests page
2. Server fetches data from database
3. Template engine injects data into HTML
4. Complete HTML sent to browser

**This is actually SSR!** (Traditional Server-Side Rendering)

**Problem:**
- Full page reload on navigation
- Browser loader spins every time
- All assets (CSS, JS, images) re-download
- Slow user experience

---

## Client-Side Rendering (CSR)

### The Single Page Application (SPA) Revolution

**How CSR Works:**

```
┌──────────────────┐         ┌────────────────┐
│   Web Server     │         │    Browser     │
│                  │  ───→   │                │
│ index.html       │         │ Empty <div>    │
│ (empty)          │         │                │
│                  │         │ + script.js    │
│ script.js        │  ───→   │ (All logic)    │
│ (bundle)         │         │                │
└──────────────────┘         └────────────────┘
```

### Key Characteristics

**What Happens:**
1. Browser requests page
2. Server sends **empty HTML** (just a `<div>`)
3. Browser downloads JavaScript bundle
4. JavaScript handles:
   - All routing (client-side)
   - Page rendering
   - Data fetching
   - User interactions

**Result:**
- ⚡ **Super fast navigation** (no page reload)
- 🎯 **Snappy user experience**
- 🔄 **No server requests for page changes**

### Demo Example (React)

```jsx
// index.html - Empty!
<div id="root"></div>
<script src="main.jsx"></script>

// Pages rendered on client
- Home Page (/) 
- About Page (/about)
- Contact Page (/contact)
```

**Navigation Flow:**
```
Click "About" → No server request → Instant page change
Click "Contact" → No server request → Instant page change
```

### CSR Problems

#### ❌ Problem 1: Poor SEO

**Issue:** Empty HTML = Poor Search Engine Crawling

```html
<!-- What search engines see -->
<div id="root"></div>
<!-- No content! -->
```

- Web crawlers can't see content
- Poor indexing
- Bad for SEO-dependent sites

#### ❌ Problem 2: Slow Initial Load

**Issue:** Large JavaScript Bundle

- Entire application loads upfront
- Can take 1-3 seconds initially
- Poor first impression
- Bad for slow networks

### When to Use CSR

✅ **Use CSR when:**
- No SEO requirements (internal dashboards)
- Client-heavy applications (Figma, design tools)
- Admin panels
- Internal company tools
- Interactive web apps

❌ **Avoid CSR when:**
- SEO is critical
- First load speed matters
- Content-heavy sites
- Public-facing websites

---

## Server-Side Rendering (SSR)

### Modern SSR (React Ecosystem)

**How Modern SSR Works:**

```
┌────────────────────────┐         ┌──────────────┐
│     Web Server         │         │   Browser    │
│                        │         │              │
│ React Component  ───→  │  ───→   │ Full HTML    │
│      ↓                 │         │ + Small JS   │
│ Convert to HTML        │         │              │
│ + Fetch Data           │         │              │
└────────────────────────┘         └──────────────┘
```

### Key Differences from CSR

| Aspect | CSR | SSR |
|--------|-----|-----|
| HTML | Empty | Complete |
| JS Bundle | Entire app | Page-specific only |
| Initial Load | Slow | Fast |
| SEO | Poor | Excellent |
| Navigation | Instant | First load matters |

### SSR Process

**Step by Step:**

1. **Browser Request:** User requests `/home`
2. **Server Processing:**
   - Takes Home component
   - Fetches required data
   - Renders component to HTML
3. **Server Response:**
   - Complete HTML (with data)
   - Small JavaScript (page-specific)
4. **Browser Display:**
   - Shows content immediately
   - JavaScript adds interactivity

### Benefits

✅ **Fast Initial Load**
- HTML ready immediately
- Smaller JavaScript bundle

✅ **Excellent SEO**
- Complete HTML for crawlers
- Proper indexing

✅ **Better User Experience**
- Content visible quickly
- Progressive enhancement

### Next.js SSR Implementation

#### Making a Page Dynamic (SSR)

**Method 1: Using fetch with no-store**

```typescript
// Force SSR with fetch
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store' // Don't cache - always fresh
});
```

**Method 2: Using dynamic export**

```typescript
// page.tsx
export const dynamic = 'force-dynamic';

export default function HomePage() {
  const seconds = new Date().getSeconds();
  
  return (
    <div>
      <h1>Home Page</h1>
      <p>Current seconds: {seconds}</p>
    </div>
  );
}
```

### Build Output Symbols

When you run `npm run build`:

```
○ (Static)   - Pre-rendered as static HTML
λ (Dynamic)  - Server-rendered on demand (SSR)
```

### SSR Problems

#### ⚠️ Problem 1: Server Load

**Issue:** Every request = Server processing

- Fetch data every time
- Render HTML every time
- High server resources

#### ⚠️ Problem 2: Unnecessary for Static Content

**Issue:** Blog posts don't change often

- Same rendering every request
- Wasted server resources
- Could be pre-rendered once

**Example Use Case:**
- Blog articles (rarely change)
- Documentation (static)
- Marketing pages (mostly static)

**Question:** Do we really need to render on every request?

**Answer:** No! → Use SSG

---

## Static Site Generation (SSG)

### The Pre-rendering Solution

**How SSG Works:**

```
┌──────────────────────┐
│   Build Time         │
│                      │
│ Component ────→ HTML │
│ (Pre-render all)     │
│                      │
│ Stored in server     │
└──────────────────────┘
           ↓
┌──────────────────────┐         ┌──────────────┐
│   Runtime            │         │   Browser    │
│                      │  ───→   │              │
│ Serve pre-built HTML │         │ Ready HTML   │
└──────────────────────┘         └──────────────┘
```

### Key Concept

**Build Time Rendering:**
- All HTML generated during `npm run build`
- Data fetched at build time
- HTML stored on server
- Served as static files

### When to Use SSG

✅ **Perfect for:**
- Blog posts
- Documentation sites
- Marketing pages
- Product pages (mostly static)
- Wikipedia-style content

✅ **Benefits:**
- ⚡ Fastest possible loading
- 🎯 Excellent SEO
- 💰 Low server costs
- 📊 High scalability

### Next.js SSG Implementation

**Default Behavior:** Next.js uses SSG by default!

```typescript
// page.tsx - Automatically static
export default function HomePage() {
  return <h1>Home Page</h1>;
}
```

**Build Output:**
```
○ /           - Static (pre-rendered)
○ /about      - Static (pre-rendered)
○ /contact    - Static (pre-rendered)
```

**Generated Files:**
```
.next/
  server/
    app/
      page.html        ← Pre-built HTML
      about/
        page.html      ← Pre-built HTML
      contact/
        page.html      ← Pre-built HTML
```

### Dynamic Routes with SSG

**Problem:** How to pre-render dynamic routes like `/post/[slug]`?

**Solution:** `generateStaticParams`

```typescript
// app/post/[slug]/page.tsx

// 1. Tell Next.js which slugs exist
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts')
    .then(res => res.json());
  
  // Return array of params
  return posts.map(post => ({
    slug: post.id.toString()
  }));
}

// 2. Use the params to render
export default async function PostPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const post = await fetch(
    `https://api.example.com/posts/${params.slug}`
  ).then(res => res.json());
  
  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </div>
  );
}
```

**How It Works:**

1. **Build Time:**
   - `generateStaticParams` runs
   - Returns: `[{slug: "1"}, {slug: "2"}, {slug: "3"}, ...]`
   - Next.js generates HTML for all slugs

2. **Output:**
   ```
   ○ /post/1
   ○ /post/2
   ○ /post/3
   ... + 97 more
   ```

3. **Runtime:**
   - All pages already exist as HTML
   - Instant serving

### SSG Problem

#### ❌ Problem: Stale Content

**Scenario:**
1. Build time: Article says "Price: $100"
2. HTML generated and deployed
3. Price updated to "$150" in database
4. Problem: HTML still shows "$100"

**Issue:** Pre-built HTML never updates!

**Solution:** ISR (Incremental Static Regeneration)

---

## Incremental Static Regeneration (ISR)

### SSG + Automatic Updates

**The Concept:**

```
Build Time:
  Generate HTML ───→ Stored on server
  
Runtime:
  Request 1-100:    Serve cached HTML (fast)
  Request 101:      HTML expired → Regenerate
  Request 102+:     Serve new HTML
```

### How ISR Works

**Key Feature:** Time-based revalidation

```typescript
export const revalidate = 30; // Seconds

export default function PostPage() {
  const seconds = new Date().getSeconds();
  
  return <div>Seconds: {seconds}</div>;
}
```

**Lifecycle:**

1. **0-30 seconds:** Serve cached HTML (shows same seconds)
2. **After 30 seconds:** 
   - Cache expires
   - Next request triggers regeneration
   - New HTML generated with fresh data
3. **30-60 seconds:** Serve new cached HTML
4. **Repeat...**

### Implementation

```typescript
// app/post/[slug]/page.tsx

// Enable ISR with 60 second revalidation
export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts')
    .then(res => res.json());
  
  return posts.map(post => ({
    slug: post.id.toString()
  }));
}

export default async function PostPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  // This fetches fresh data every 60 seconds
  const post = await fetch(
    `https://api.example.com/posts/${params.slug}`
  ).then(res => res.json());
  
  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
      <p>Last updated: {new Date().toISOString()}</p>
    </div>
  );
}
```

### ISR Timeline Example

```
Time    Request    Action
────────────────────────────────────────────
0:00    Visit      Serve cached HTML (v1)
0:15    Visit      Serve cached HTML (v1)
0:30    Visit      Serve cached HTML (v1)
0:35    Visit      Cache expired → Regenerate
                   Serve HTML (v2) with fresh data
0:40    Visit      Serve cached HTML (v2)
1:05    Visit      Cache expired → Regenerate
                   Serve HTML (v3) with fresh data
```

### Benefits

✅ **Best of Both Worlds:**
- Fast like SSG (cached)
- Fresh like SSR (updates)
- Low server load

✅ **Perfect For:**
- E-commerce product pages
- Blog posts that occasionally update
- News articles
- Content that changes predictably

### Revalidation Strategies

**Common Time Intervals:**

```typescript
export const revalidate = 10;    // 10 seconds (very dynamic)
export const revalidate = 60;    // 1 minute
export const revalidate = 300;   // 5 minutes
export const revalidate = 3600;  // 1 hour
export const revalidate = 86400; // 24 hours (daily)
```

**Choose Based On:**
- Content update frequency
- Server load capacity
- User expectations
- Cost considerations

---

## Incremental Static Generation (ISG)

### On-Demand Page Generation

**The Problem ISG Solves:**

**Scenario:** E-commerce site with 1 million products

- SSG: Generate 1M HTML files at build time? ❌
  - Build takes hours
  - Huge storage
  - Most pages never visited

- SSR: Render on every request? ❌
  - High server load
  - Slower response

**Solution:** Generate pages on-demand (as needed)

### How ISG Works

```
First Request:
  User visits /product/123
  → Page doesn't exist yet
  → Generate HTML now
  → Cache it
  → Serve to user
  
Subsequent Requests:
  User visits /product/123
  → Page exists in cache
  → Serve instantly
```

### ISG vs SSG

| Aspect | SSG | ISG |
|--------|-----|-----|
| When | Build time | First request |
| All Pages | Yes (pre-built) | No (on-demand) |
| Build Time | Long for many pages | Fast |
| First Visit | Instant | Slight delay |
| Storage | All pages stored | Only visited pages |

### Next.js ISG Implementation

```typescript
// app/product/[id]/page.tsx

export async function generateStaticParams() {
  // Only generate popular products at build time
  const popularProducts = await getPopularProducts();
  
  return popularProducts.map(product => ({
    id: product.id.toString()
  }));
}

export default async function ProductPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const product = await fetch(
    `https://api.example.com/products/${params.id}`
  ).then(res => res.json());
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>${product.price}</p>
    </div>
  );
}
```

**What Happens:**

1. **Build Time:**
   - Generate only popular products (e.g., top 100)
   - Fast build

2. **Runtime:**
   - Unpopular product requested
   - Generate HTML on-demand
   - Cache for future requests

### Combining ISR + ISG

**Best Practice:** Use both together!

```typescript
export const revalidate = 3600; // Update every hour

export async function generateStaticParams() {
  return getTopProducts(); // Pre-build top 100
}
```

**Result:**
- Top 100: Pre-built at build time ✅
- Others: Generated on first visit ✅
- All: Update every hour ✅

---

## Choosing the Right Technique

### Decision Tree

```
Does your app need SEO?
│
├─ NO ──→ CSR (Client-Side Rendering)
│         Use: Dashboards, internal tools, Figma-like apps
│
└─ YES ──→ Does content change frequently?
           │
           ├─ YES ──→ SSR (Server-Side Rendering)
           │          Use: Social feeds, real-time data, personalized content
           │
           └─ NO ──→ How many pages?
                     │
                     ├─ Few (< 1000) ──→ SSG (Static Site Generation)
                     │                   Use: Blogs, docs, marketing sites
                     │
                     └─ Many (> 1000) ──→ ISG + ISR
                                         Use: E-commerce, large content sites
```

### Comparison Table

| Technique | SEO | Speed | Server Load | Use Case |
|-----------|-----|-------|-------------|----------|
| **CSR** | ❌ Poor | ⚡ Fast (after load) | ✅ Low | Dashboards, tools |
| **SSR** | ✅ Excellent | ⚡ Fast | ❌ High | Dynamic content |
| **SSG** | ✅ Excellent | ⚡⚡ Fastest | ✅ Lowest | Static content |
| **ISR** | ✅ Excellent | ⚡ Fast | ✅ Low | Semi-static content |
| **ISG** | ✅ Excellent | ⚡ Fast | ✅ Medium | Large sites |

### Real-World Examples

#### CSR (Client-Side Rendering)
**Examples:**
- Figma (design tool)
- Admin dashboards
- Internal company tools
- Canvas-heavy apps

**Why:**
- No SEO needed
- Highly interactive
- Client-heavy operations

#### SSR (Server-Side Rendering)
**Examples:**
- Twitter/X feed
- Instagram feed
- Personalized dashboards
- Real-time data apps

**Why:**
- Content changes frequently
- User-specific data
- SEO important

#### SSG (Static Site Generation)
**Examples:**
- Personal blogs
- Documentation sites (Next.js docs)
- Marketing websites
- Landing pages

**Why:**
- Content rarely changes
- Excellent performance
- Low costs

#### ISR (Incremental Static Regeneration)
**Examples:**
- E-commerce product pages
- News websites
- Weather apps
- Stock price sites

**Why:**
- Content updates periodically
- Need both speed and freshness
- Predictable update patterns

#### ISG (Incremental Static Generation)
**Examples:**
- Amazon (millions of products)
- Wikipedia (millions of articles)
- Large e-commerce sites
- Content platforms

**Why:**
- Too many pages to pre-build
- Most pages rarely visited
- Need scalability

---

## Next.js Implementation

### Project Structure Example

```
app/
├── (static)/              # SSG pages
│   ├── about/
│   │   └── page.tsx
│   └── privacy/
│       └── page.tsx
│
├── blog/                  # ISR blogs
│   └── [slug]/
│       └── page.tsx       # revalidate: 3600
│
├── products/              # ISG products
│   └── [id]/
│       └── page.tsx       # generateStaticParams
│
├── dashboard/             # CSR dashboard
│   └── page.tsx           # 'use client'
│
└── feed/                  # SSR feed
    └── page.tsx           # dynamic: 'force-dynamic'
```

### Configuration Examples

#### 1. Pure SSG (Default)

```typescript
// app/about/page.tsx
export default function AboutPage() {
  return <h1>About Us</h1>;
}
// Automatically static ○
```

#### 2. SSR (Dynamic)

```typescript
// app/dashboard/page.tsx
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store'
  });
  
  return <div>{/* Dynamic content */}</div>;
}
// Server-rendered λ
```

#### 3. ISR (Revalidate)

```typescript
// app/blog/[slug]/page.tsx
export const revalidate = 3600; // 1 hour

export default async function BlogPost({ params }) {
  const post = await fetch(`https://api.example.com/posts/${params.slug}`);
  return <article>{/* Post content */}</article>;
}
// ISR with 1-hour cache ◐
```

#### 4. ISG (Generate on Demand)

```typescript
// app/products/[id]/page.tsx
export async function generateStaticParams() {
  // Pre-build only top 100
  const topProducts = await getTopProducts(100);
  
  return topProducts.map(product => ({
    id: product.id
  }));
}

export default async function ProductPage({ params }) {
  const product = await fetch(`https://api.example.com/products/${params.id}`);
  return <div>{/* Product details */}</div>;
}
// Top 100: Pre-built ○
// Others: Generated on-demand
```

#### 5. CSR (Client Component)

```typescript
// app/interactive/page.tsx
'use client';

import { useState } from 'react';

export default function InteractivePage() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicks: {count}
    </button>
  );
}
// Client-rendered
```

---

## Best Practices

### 1. Mix and Match

**Don't use one technique for everything!**

```typescript
app/
├── page.tsx                    # SSG (static homepage)
├── blog/[slug]/page.tsx       # ISR (blogs update weekly)
├── products/[id]/page.tsx     # ISG (millions of products)
├── dashboard/page.tsx         # CSR (user-specific)
└── api/feed/route.ts          # SSR (real-time API)
```

### 2. Start Static, Go Dynamic

**Default to static, make dynamic only when needed**

```typescript
// ✅ Good: Default static
export default function Page() { }

// ✅ Better: Add revalidation if needed
export const revalidate = 3600;

// ✅ Best: Dynamic only if absolutely necessary
export const dynamic = 'force-dynamic';
```

### 3. Use ISR Over SSR When Possible

**Prefer ISR for better performance:**

```typescript
// ❌ Avoid: SSR for rarely-changing content
export const dynamic = 'force-dynamic';

// ✅ Better: ISR with reasonable revalidation
export const revalidate = 3600; // Updates when needed
```

### 4. Optimize Build Time

**For large sites, use ISG:**

```typescript
export async function generateStaticParams() {
  // ❌ Don't: Build all 1M products
  // const all = await getAllProducts(); // Takes hours!
  
  // ✅ Do: Build only popular ones
  const popular = await getPopularProducts(1000);
  return popular; // Fast build, on-demand rest
}
```

### 5. Monitor and Adjust

**Use analytics to optimize:**

```typescript
// Track which pages are visited most
// Pre-build those at build time
// Let others generate on-demand

export async function generateStaticParams() {
  const mostVisited = await getAnalytics('most-visited', 500);
  return mostVisited; // Data-driven approach
}
```

---

## Build Symbols Reference

When running `npm run build` in Next.js:

```
Symbol  Meaning
──────────────────────────────────────────────
○       Static - Pre-rendered at build time
λ       Dynamic - Server-rendered on demand
◐       ISR - Static with revalidation
ƒ       API Route
```

### Example Build Output

```bash
Route (app)                      Size
───────────────────────────────────────
○ /                              1.2 kB
○ /about                         800 B
λ /dashboard                     2.1 kB
◐ /blog/[slug]                   1.5 kB
  ├ /blog/post-1                 (revalidate: 3600)
  ├ /blog/post-2
  └ + 98 more
```

---

## Performance Metrics

### Load Time Comparison

| Technique | First Load | Navigation | SEO | Server Cost |
|-----------|-----------|------------|-----|-------------|
| **CSR** | 2-3s | Instant | Poor | Low |
| **SSR** | 0.5-1s | 0.5-1s | Excellent | High |
| **SSG** | 0.1-0.3s | Instant | Excellent | Very Low |
| **ISR** | 0.1-0.3s | Instant | Excellent | Low |

### Cost Comparison (Monthly)

**Scenario:** 100,000 page views

| Technique | Server Cost | CDN Cost | Total |
|-----------|------------|----------|-------|
| **CSR** | $10 | $5 | $15 |
| **SSR** | $200 | $10 | $210 |
| **SSG** | $10 | $20 | $30 |
| **ISR** | $20 | $20 | $40 |

*Approximate costs, actual may vary*

---

## Common Patterns

### Pattern 1: Marketing Site

```typescript
// Static pages
○ /                    # Homepage
○ /about              # About page
○ /pricing            # Pricing page
◐ /blog/[slug]        # Blog with ISR (revalidate: 86400)
```

### Pattern 2: E-commerce

```typescript
○ /                           # Homepage (static)
◐ /products/[id]             # Products (ISR: 3600)
λ /cart                      # Cart (SSR)
λ /checkout                  # Checkout (SSR)
'use client' /dashboard      # User dashboard (CSR)
```

### Pattern 3: SaaS Application

```typescript
○ /                          # Landing page
○ /features                  # Features page
'use client' /app/*         # Entire app (CSR)
λ /api/*                    # API routes (SSR)
```

### Pattern 4: Content Platform

```typescript
○ /                              # Homepage
◐ /articles/[slug]              # Articles (ISR: 3600)
ISG /users/[id]                 # User profiles (on-demand)
λ /search                       # Search (SSR)
```

---

## Troubleshooting

### Issue 1: Page Not Updating

**Problem:** ISR page shows old content

```typescript
// Check revalidation time
export const revalidate = 60; // Make sure this is set

// Force revalidation
await fetch('/api/revalidate?path=/blog/post-1');
```

### Issue 2: Build Too Slow

**Problem:** Too many pages at build time

```typescript
// ❌ Before: Building 100k pages
export async function generateStaticParams() {
  return getAllPages(); // Slow!
}

// ✅ After: Build only important pages
export async function generateStaticParams() {
  return getTopPages(1000); // Fast!
}
```

### Issue 3: High Server Costs

**Problem:** Using SSR for everything

```typescript
// ❌ Before: SSR everywhere
export const dynamic = 'force-dynamic';

// ✅ After: Use ISR instead
export const revalidate = 300; // Much cheaper
```

---

## Quick Reference

### When to Use Each Technique

```
Need SEO?
└─ No  → CSR
└─ Yes → Content frequency?
         ├─ Real-time → SSR
         ├─ Static    → SSG
         ├─ Periodic  → ISR
         └─ Many pages → ISG
```

### Code Snippets

```typescript
// CSR
'use client'

// SSR
export const dynamic = 'force-dynamic'

// SSG
// (default, no config needed)

// ISR
export const revalidate = 3600

// ISG
export async function generateStaticParams() {
  return topItems
}
```

---

## Additional Resources

- **Next.js Documentation:** https://nextjs.org/docs
- **React Server Components:** [Link to video mentioned]
- **Original Tutorial:** Codsज्ञान Channel

---

## Conclusion

### Key Takeaways

1. **No One-Size-Fits-All:** Choose based on your needs
2. **Mix Techniques:** Use different techniques for different pages
3. **Start Static:** Default to SSG/ISR, use SSR only when needed
4. **Monitor Performance:** Adjust based on real-world data
5. **Consider Costs:** Balance performance with server costs

### The Golden Rule

> "Make it as static as possible, as dynamic as necessary"

---

**Source:** Codsज्ञान Channel by Rakesh  
**Remember:** User experience,