# MERN Stack Scalable Folder Structure Guide

## Overview

A comprehensive guide to structuring MERN (MongoDB, Express, React, Node.js) stack projects for scalability and maintainability. This guide covers both backend (Server) and frontend (Web) folder organization using industry best practices.

**Source:** Codsज्ञान Channel by Rakesh  
**Stack:** MongoDB, Express.js, React/Next.js, Node.js

---

## Project Root Structure

```
project-root/
├── server/          # Backend application
├── web/             # Frontend application (or 'client'/'frontend')
├── shared/          # Shared code between frontend and backend
└── infra/           # Infrastructure configuration
```

### Naming Conventions
- **Backend:** `server` or `backend`
- **Frontend:** `web`, `client`, or `frontend`
- Choose one naming convention and stick with it

---

## Part 1: Backend (Server) Structure

### Understanding MVC Architecture

Before diving into the folder structure, understand the **MVC (Model-View-Controller)** pattern:

- **Model:** Data layer - handles database operations and data structure
- **View:** Presentation layer - web pages (handled by separate frontend in our case)
- **Controller:** Logic layer - handles requests and responses

**Note:** In our MERN setup, we don't have a "View" folder since the frontend is separate. We use **Model** and **Controller** with additional layers.

---

### Request Flow in Backend

```
Request → Router → Middleware → Controller → Service → Repository → Database
                                    ↓
                                Response
```

**Flow Explanation:**
1. **Router:** First point of contact for incoming requests
2. **Middleware:** Authentication, logging, validation (optional step)
3. **Controller:** Handles request/response, NO business logic
4. **Service:** Contains all business logic
5. **Repository:** Direct database communication (Repository Pattern)
6. **Database:** MongoDB (external)

---

### Complete Backend Folder Structure

```
server/
├── src/
│   ├── routes/
│   │   ├── product-router.ts
│   │   └── user-router.ts
│   │
│   ├── controllers/
│   │   ├── product-controller.ts
│   │   └── user-controller.ts
│   │
│   ├── services/
│   │   ├── product-service.ts
│   │   └── user-service.ts
│   │
│   ├── repositories/
│   │   ├── product-repository.ts
│   │   └── user-repository.ts
│   │
│   ├── models/
│   │   ├── product-model.ts
│   │   └── user-model.ts
│   │
│   ├── middlewares/
│   │   ├── auth-middleware.ts
│   │   └── logger-middleware.ts
│   │
│   ├── validators/
│   │   ├── create-product-validator.ts
│   │   └── user-validator.ts
│   │
│   ├── config/
│   │   ├── db.ts
│   │   ├── logger.ts
│   │   └── s3.ts
│   │
│   ├── types/              # TypeScript only
│   │   └── product.ts
│   │
│   ├── utils/
│   │   └── index.ts
│   │
│   ├── app.ts             # Express app initialization
│   └── server.ts          # Server startup
│
├── tests/                 # Test files (outside src)
│   ├── unit/
│   └── integration/
│
├── .env                   # Environment variables (gitignored)
├── .env.example          # Example env file (committed to git)
├── .gitignore
├── package.json
├── tsconfig.json         # TypeScript config
└── eslintrc.js          # ESLint config
```

---

### Detailed Folder Breakdown

#### 1. Routes (`src/routes/`)
- Define all API endpoints
- Multiple routers for different resources
- Naming: `resource-router.ts`

```typescript
// product-router.ts
import express from 'express';
const router = express.Router();
// Define routes here
export default router;
```

#### 2. Controllers (`src/controllers/`)
- Handle request/response only
- NO business logic
- Call service layer functions
- Naming: `resource-controller.ts`

```typescript
// product-controller.ts
export const getProducts = (req, res) => {
  const products = productService.getAllProducts();
  res.json(products);
};
```

#### 3. Services (`src/services/`)
- Contains ALL business logic
- Called by controllers
- Calls repository for database operations
- Naming: `resource-service.ts`

```typescript
// product-service.ts
export const getAllProducts = () => {
  return productRepository.findAll();
};
```

#### 4. Repositories (`src/repositories/`)
- Direct database communication
- CRUD operations
- Repository Pattern for abstraction
- Naming: `resource-repository.ts`

```typescript
// product-repository.ts
export const findAll = async () => {
  return await ProductModel.find();
};
```

#### 5. Models (`src/models/`)
- MongoDB schemas and models
- Define database structure
- Mongoose schemas
- Naming: `resource-model.ts`

```typescript
// product-model.ts
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: String,
  price: Number
});

export default mongoose.model('Product', productSchema);
```

#### 6. Middlewares (`src/middlewares/`)
- Authentication checks
- Request logging
- Validation
- Between router and controller
- Naming: `purpose-middleware.ts`

```typescript
// auth-middleware.ts
export const authenticate = (req, res, next) => {
  // Check authentication
  next();
};
```

#### 7. Validators (`src/validators/`)
- Request validation logic
- Use libraries like express-validator or Zod
- Keep validation separate from controllers
- Naming: `action-validator.ts`

```typescript
// create-product-validator.ts
import { body } from 'express-validator';

export const createProductValidator = [
  body('name').notEmpty(),
  body('price').isNumeric()
];
```

#### 8. Config (`src/config/`)
- Database connections
- External service initialization (S3, Kafka, Logger)
- Configuration files
- Naming: `service.ts`

```typescript
// db.ts
import mongoose from 'mongoose';

export const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
};
```

#### 9. Types (`src/types/`) - TypeScript Only
- Type definitions and interfaces
- Shared across application
- Skip this folder for JavaScript projects

```typescript
// product.ts
export interface Product {
  name: string;
  price: number;
}
```

#### 10. Utils (`src/utils/`)
- Reusable utility functions
- Used throughout the application
- Avoid code duplication

```typescript
// index.ts
export const formatDate = (date: Date): string => {
  return date.toISOString();
};
```

#### 11. App.ts (`src/app.ts`)
- Initialize Express app
- Register routes
- Register middlewares
- NO server startup (app.listen)
- Export app for testing

```typescript
// app.ts
import express from 'express';
import productRouter from './routes/product-router';

const app = express();

// Register routes
app.use('/api/products', productRouter);

export default app;
```

#### 12. Server.ts (`src/server.ts`)
- Start the server
- Import app from app.ts
- Use app.listen() here

```typescript
// server.ts
import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Why Separate app.ts and server.ts?**
- Testing: Import `app.ts` in tests without starting server
- Prevents multiple server instances during testing

---

### Environment Variables Best Practices

#### .env File
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/mydb
API_KEY=your-secret-key
```

#### .env.example File
```env
PORT=
MONGO_URI=
API_KEY=
```

**Best Practice:**
1. Keep `.env` in `.gitignore` (never commit secrets)
2. Create `.env.example` with empty values (commit this)
3. Team members copy `.env.example` to `.env` and fill their values

---

### Testing Structure

```
tests/
├── unit/
│   ├── product-service.test.ts
│   └── user-service.test.ts
└── integration/
    ├── product-api.test.ts
    └── user-api.test.ts
```

**Why Outside src/?**
- Not needed in production
- Easier to exclude from compilation
- Cleaner separation

---

## Part 2: Frontend (Next.js) Structure

### Understanding Next.js File-based Routing

Next.js uses **folder-based routing** - no need to configure routers manually.

**How it works:**
```
app/
├── page.tsx              → / (home page)
├── products/
│   └── page.tsx         → /products
└── about/
    └── page.tsx         → /about
```

- Folders define routes
- `page.tsx` is required to create actual route
- Folder without `page.tsx` = no route (useful for organization)

---

### Complete Frontend Folder Structure

```
web/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                 # Home page (/)
│   │   │
│   │   ├── (auth)/                  # Route grouping (not in URL)
│   │   │   ├── login/
│   │   │   │   └── page.tsx        # /login
│   │   │   └── register/
│   │   │       └── page.tsx        # /register
│   │   │
│   │   ├── products/
│   │   │   ├── _components/        # Page-specific components
│   │   │   │   └── product-card.tsx
│   │   │   ├── _hooks/             # Page-specific hooks
│   │   │   │   └── use-products.ts
│   │   │   └── page.tsx            # /products
│   │   │
│   │   ├── layout.tsx              # Root layout
│   │   └── globals.css             # Global styles
│   │
│   └── shared/                      # Shared across app
│       ├── components/              # Reusable components
│       │   ├── button.tsx
│       │   └── modal.tsx
│       ├── hooks/                   # Reusable hooks
│       │   └── use-auth.ts
│       ├── utils/                   # Utility functions
│       │   └── format-date.ts
│       └── types/                   # TypeScript types
│           └── user.ts
│
├── public/                          # Static assets
│   ├── images/
│   └── favicon.ico
│
├── .env.local                       # Environment variables
├── .env.example
├── next.config.js                   # Next.js config
├── tailwind.config.js              # Tailwind config
├── tsconfig.json
└── package.json
```

---

### Key Frontend Concepts

#### 1. Route Grouping with `()`

Group related routes without affecting URL structure:

```
app/
└── (auth)/              # Grouping - NOT in URL
    ├── login/          
    │   └── page.tsx    # URL: /login (NOT /auth/login)
    └── register/
        └── page.tsx    # URL: /register (NOT /auth/register)
```

**Benefits:**
- Better organization
- Cleaner folder structure
- No URL impact

#### 2. Private Folders with `_`

Mark folders as non-routes for clarity:

```
products/
├── _components/         # Not a route (starts with _)
│   └── product-card.tsx
├── _hooks/             # Not a route (starts with _)
│   └── use-products.ts
└── page.tsx            # /products route
```

**Why use underscore?**
- Visual indicator: "This is not a route"
- Folders without `page.tsx` won't be routes anyway
- Improves readability

#### 3. Page-specific vs Shared Resources

**Page-specific (inside route folder):**
```
products/
├── _components/         # Only used in products page
├── _hooks/             # Only used in products page
└── page.tsx
```

**Shared (in src/shared/):**
```
src/shared/
├── components/         # Used across multiple pages
├── hooks/             # Used across multiple pages
└── utils/             # Used across multiple pages
```

---

### shadcn/ui Integration

If using shadcn/ui, configure it to use the shared folder:

```
src/
└── shared/
    └── components/
        └── ui/              # shadcn components go here
            ├── button.tsx
            └── dialog.tsx
```

Update `components.json`:
```json
{
  "aliases": {
    "components": "@/shared/components",
    "utils": "@/shared/utils"
  }
}
```

---

### Environment Variables (Next.js)

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=mongodb://localhost:27017/mydb
```

**Important:**
- Variables starting with `NEXT_PUBLIC_` are exposed to browser
- Other variables are server-side only

---

## Part 3: Shared Resources

For code used by BOTH frontend and backend:

```
shared/
├── types/
│   ├── product.ts       # Shared type definitions
│   └── user.ts
└── utils/
    ├── validation.ts    # Shared validation logic
    └── format.ts       # Shared formatting functions
```

**Example Use Case:**
```typescript
// shared/types/product.ts
export interface Product {
  id: string;
  name: string;
  price: number;
}

// Used in both:
// - server/src/services/product-service.ts
// - web/src/app/products/page.tsx
```

---

## Part 4: Infrastructure Configuration

```
infra/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── kubernetes/
│   ├── deployment.yaml
│   └── service.yaml
└── nginx/
    └── nginx.conf
```

**Purpose:**
- Deployment configurations
- Container setups
- Proxy configurations
- Infrastructure as Code

---

## Complete Project Structure

```
project-root/
│
├── server/                    # Backend
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── middlewares/
│   │   ├── validators/
│   │   ├── config/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── web/                       # Frontend
│   ├── src/
│   │   ├── app/
│   │   └── shared/
│   ├── public/
│   ├── .env.local
│   └── package.json
│
├── shared/                    # Shared code
│   ├── types/
│   └── utils/
│
└── infra/                     # Infrastructure
    ├── docker/
    ├── kubernetes/
    └── nginx/
```

---

## Best Practices Summary

### Backend
1. ✅ Use MVC + Repository pattern
2. ✅ Separate business logic (services) from controllers
3. ✅ Keep controllers thin - only handle request/response
4. ✅ Use separate files for app initialization (app.ts) and server startup (server.ts)
5. ✅ Place tests outside src folder
6. ✅ Use clear naming conventions (resource-type.ts)

### Frontend
1. ✅ Use route grouping `()` for organization
2. ✅ Use `_` prefix for non-route folders
3. ✅ Separate page-specific and shared components
4. ✅ Keep src/shared for reusable code
5. ✅ Follow Next.js file-based routing conventions

### General
1. ✅ Keep it simple - don't over-complicate
2. ✅ Use .env.example for team collaboration
3. ✅ Maintain consistent naming conventions
4. ✅ Separate concerns properly
5. ✅ Think about scalability from the start

---

## Key Principles

### 1. Separation of Concerns
Each folder has ONE clear responsibility.

### 2. Scalability
Structure supports growth without major refactoring.

### 3. Maintainability
Easy to find and update code.

### 4. Readability
Clear naming and organization.

### 5. Testability
Easy to write and run tests.

---

## Common Mistakes to Avoid

❌ **Don't:** Put business logic in controllers  
✅ **Do:** Keep business logic in services

❌ **Don't:** Access database directly from controllers  
✅ **Do:** Use repository pattern

❌ **Don't:** Mix page-specific and shared components  
✅ **Do:** Organize based on usage scope

❌ **Don't:** Commit .env files with secrets  
✅ **Do:** Use .env.example and .gitignore

❌ **Don't:** Over-complicate the structure  
✅ **Do:** Keep it simple and functional

---

## Getting Started

### Backend Setup
```bash
cd server
npm init -y
npm install express mongoose dotenv
npm install -D typescript @types/node @types/express

# Create folder structure
mkdir -p src/{routes,controllers,services,repositories,models,middlewares,validators,config,types,utils}
```

### Frontend Setup
```bash
cd web
bunx create-next-app@latest .

# Select options:
# ✅ TypeScript
# ✅ ESLint
# ✅ Tailwind CSS
# ✅ src/ directory
# ✅ App Router
```

---

## Additional Resources

- Original video on Codsज्ञान Channel
- Next.js Documentation: https://nextjs.org/docs
- Express.js Best Practices
- MongoDB Schema Design

---

## Conclusion

This folder structure provides:
- **Clear organization** for large-scale applications
- **Easy navigation** for developers
- **Scalability** for growing projects
- **Maintainability** for long-term development

Remember: **Keep it simple. Don't over-engineer. Organize as you grow.**

---

**Source:** Codsज्ञान Channel by Rakesh  
**For detailed implementation:** Check the original video tutorial