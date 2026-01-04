# Complete Guide to TypeScript/JavaScript Decorators

## Overview

A comprehensive guide to understanding and implementing decorators in TypeScript/JavaScript. Learn how decorators work, how to create custom decorators, and implement real-world examples like authorization and logging.

**Source:** Codsज्ञान Channel by Rakesh  
**Topics:** Decorators, TypeScript, Method Decorators, Authorization, Meta-programming

---

## Table of Contents

1. [What Are Decorators?](#what-are-decorators)
2. [Why Use Decorators?](#why-use-decorators)
3. [Real-World Examples](#real-world-examples)
4. [How Decorators Work](#how-decorators-work)
5. [Creating Your First Decorator](#creating-your-first-decorator)
6. [Real-World Implementation](#real-world-implementation)
7. [Dynamic Decorators](#dynamic-decorators)
8. [Types of Decorators](#types-of-decorators)
9. [Setup & Configuration](#setup--configuration)
10. [Best Practices](#best-practices)

---

## What Are Decorators?

Decorators are a special syntax in TypeScript/JavaScript that allow you to **modify or enhance** the behavior of classes, methods, properties, or parameters.

### Syntax

```typescript
@decoratorName
methodName() {
  // method code
}

// With parameters
@decoratorName('param1', 'param2')
methodName() {
  // method code
}
```

### Key Concept

> **Decorators are just functions** that can modify the behavior of the code they're attached to.

---

## Why Use Decorators?

### The Problem: Code Repetition

**Without Decorators:**

```typescript
class ProductController {
  create() {
    console.log('Create method called'); // Repeated logging
    console.log('Product has been created');
  }
  
  update() {
    console.log('Update method called'); // Repeated logging
    console.log('Product has been updated');
  }
}
```

**Issues:**
- Logging code repeated in every method
- What if logging logic is 10-50 lines?
- Hard to maintain
- Clutters method logic

**With Decorators:**

```typescript
class ProductController {
  @log
  create() {
    console.log('Product has been created');
  }
  
  @log
  update() {
    console.log('Product has been updated');
  }
}
```

**Benefits:**
✅ Clean, declarative syntax  
✅ No code repetition  
✅ Easy to maintain  
✅ Self-documenting code  
✅ Separation of concerns

---

## Real-World Examples

### NestJS Framework Example

```typescript
@Controller('products')
export class ProductController {
  
  @Post()
  @UseGuards(AuthGuard)
  @Roles('admin')
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }
}
```

**What's Happening:**
- `@Controller`: Defines route prefix
- `@Post()`: HTTP POST method
- `@UseGuards`: Checks authentication
- `@Roles('admin')`: Only admin can access
- `@Body()`: Parameter decorator

**Without decorators, you'd need:**
```typescript
create(dto: CreateProductDto) {
  // Manual authentication check
  if (!isAuthenticated(user)) {
    throw new UnauthorizedException();
  }
  
  // Manual role check
  if (user.role !== 'admin') {
    throw new ForbiddenException();
  }
  
  // Actual logic
  return this.productService.create(dto);
}
```

---

## How Decorators Work

### Core Concept: Function Wrapping

Decorators work by **wrapping the original method** in another function.

```
┌─────────────────────────────────────┐
│  Original Method: create()          │
│  ├─ console.log('Product created')  │
└─────────────────────────────────────┘
                 ↓
         Wrap with decorator
                 ↓
┌─────────────────────────────────────┐
│  Wrapper Function                   │
│  ├─ console.log('Method called')    │ ← Added by decorator
│  ├─ call original create()          │ ← Original method
│  └─ return result                   │
└─────────────────────────────────────┘
                 ↓
         Replace original
                 ↓
┌─────────────────────────────────────┐
│  When create() is called:           │
│  1. Decorator logic runs first      │
│  2. Original method runs            │
└─────────────────────────────────────┘
```

---

## Creating Your First Decorator

### Step 1: The Problem

```typescript
class ProductController {
  create() {
    console.log('Create method called'); // Want to avoid this
    console.log('Product has been created');
  }
  
  update() {
    console.log('Update method called'); // Want to avoid this
    console.log('Product has been updated');
  }
}
```

### Step 2: Create the Decorator

**A decorator is just a function!**

```typescript
function log(
  target: any,              // The class
  key: string,              // Method name (e.g., "create")
  descriptor: PropertyDescriptor  // Method details
) {
  // Store original method
  const originalMethod = descriptor.value;
  
  // Replace with wrapper function
  descriptor.value = function(...args: unknown[]) {
    // Decorator logic - runs FIRST
    console.log(`The ${key} method has been called`);
    
    // Call original method
    return originalMethod.apply(this, args);
  };
}
```

### Step 3: Use the Decorator

```typescript
class ProductController {
  @log
  create() {
    console.log('Product has been created');
  }
  
  @log
  update() {
    console.log('Product has been updated');
  }
}
```

### Step 4: Test It

```typescript
const product = new ProductController();
product.create();

// Output:
// The create method has been called
// Product has been created
```

---

## Understanding Decorator Parameters

### Method Decorator Parameters

```typescript
function myDecorator(
  target: any,               // The class prototype
  key: string,               // Method name
  descriptor: PropertyDescriptor  // Method descriptor
) {
  // ...
}
```

#### 1. `target`
- Reference to the class
- The class prototype

#### 2. `key`
- The method name as a string
- Example: `"create"`, `"update"`

#### 3. `descriptor`
- Object containing method details
- Most important: `descriptor.value` = the actual method function

---

## Real-World Implementation

### Use Case: Role-Based Authorization

**Goal:** Only allow admin users to call certain methods.

### Step 1: Simple Version (Hardcoded)

```typescript
function admin(
  target: any,
  key: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: unknown[]) {
    // First argument is request object
    const request = args[0];
    
    // Check if user has admin role
    if (request.user.role !== 'admin') {
      console.log('Not allowed');
      return; // Don't call original method
    }
    
    // User is admin - call original method
    return originalMethod.apply(this, args);
  };
}
```

**Usage:**

```typescript
class ProductController {
  @admin
  create(request: any) {
    console.log('Product has been created');
  }
}
```

**Test:**

```typescript
const controller = new ProductController();

// Guest user
const request1 = { user: { role: 'guest' } };
controller.create(request1); // Output: Not allowed

// Admin user
const request2 = { user: { role: 'admin' } };
controller.create(request2); // Output: Product has been created
```

---

## Dynamic Decorators

### The Problem with Hardcoded Values

What if you have multiple roles? Create a decorator for each?
- `@admin`
- `@manager`
- `@teacher`
- `@student`

**Better solution:** Make the decorator dynamic!

### Step 2: Dynamic Role Decorator

**Goal:** `@role('admin', 'manager')`

```typescript
function role(...allowedRoles: string[]) {
  // Outer function receives parameters
  return function(
    target: any,
    key: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: unknown[]) {
      const request = args[0];
      const userRole = request.user.role;
      
      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(userRole)) {
        console.log('Not allowed');
        return;
      }
      
      return originalMethod.apply(this, args);
    };
  };
}
```

### Pattern: Decorator Factory

```typescript
// Decorator Factory (returns a decorator)
function decoratorName(...params) {
  // Outer function - receives parameters
  
  return function(target, key, descriptor) {
    // Inner function - the actual decorator
  };
}
```

### Usage Examples

```typescript
class ProductController {
  @role('admin')
  create(request: any) {
    console.log('Product has been created');
  }
  
  @role('manager')
  update(request: any) {
    console.log('Product has been updated');
  }
  
  @role('admin', 'manager')
  delete(request: any) {
    console.log('Product has been deleted');
  }
}
```

### Testing

```typescript
const controller = new ProductController();

// Admin user can create
const adminReq = { user: { role: 'admin' } };
controller.create(adminReq); // ✅ Works

// Manager user cannot create
const managerReq = { user: { role: 'manager' } };
controller.create(managerReq); // ❌ Not allowed

// But manager can update
controller.update(managerReq); // ✅ Works

// Both admin and manager can delete
controller.delete(adminReq); // ✅ Works
controller.delete(managerReq); // ✅ Works
```

---

## Complete Real-World Example

### Authorization Decorator Implementation

```typescript
// decorators/role.decorator.ts
function role(...allowedRoles: string[]) {
  return function(
    target: any,
    key: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: unknown[]) {
      const request = args[0];
      
      // Authorization check
      if (!allowedRoles.includes(request.user.role)) {
        console.log('Access denied');
        return;
      }
      
      // Call original method
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

export { role };
```

### Controller with Authorization

```typescript
// controllers/product.controller.ts
import { role } from './decorators/role.decorator';

class ProductController {
  @role('admin')
  create(request: any) {
    console.log('Product has been created');
  }
  
  @role('admin', 'manager')
  update(request: any) {
    console.log('Product has been updated');
  }
  
  @role('admin', 'manager', 'user')
  list(request: any) {
    console.log('Listing products');
  }
}
```

---

## Types of Decorators

Decorators can be applied to different parts of a class:

### 1. Method Decorators (Most Common)

```typescript
class MyClass {
  @myDecorator
  myMethod() {
    // ...
  }
}
```

**Parameters:** `(target, key, descriptor)`

### 2. Class Decorators

```typescript
@myClassDecorator
class MyClass {
  // ...
}
```

**Parameters:** `(constructor)`

### 3. Property Decorators

```typescript
class MyClass {
  @myPropertyDecorator
  private name: string;
}
```

**Parameters:** `(target, propertyKey)`

### 4. Parameter Decorators

```typescript
class MyClass {
  myMethod(@myParamDecorator param: string) {
    // ...
  }
}
```

**Parameters:** `(target, propertyKey, parameterIndex)`

### 5. Accessor Decorators

```typescript
class MyClass {
  @myAccessorDecorator
  get value() {
    return this._value;
  }
}
```

---

## Setup & Configuration

### TypeScript Project Setup

#### 1. Initialize Project

```bash
# Using Bun
bun init

# Or using npm
npm init -y
```

#### 2. Install Dependencies

```bash
# Required for decorators
bun add reflect-metadata

# Or with npm
npm install reflect-metadata
```

#### 3. Configure tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true
  }
}
```

**Critical Settings:**
- `experimentalDecorators: true` - Enable decorators
- `emitDecoratorMetadata: true` - Emit metadata

#### 4. Import reflect-metadata

**At the top of your entry file:**

```typescript
import 'reflect-metadata';

// Rest of your code
```

### Running the Code

```bash
# Using Bun (supports TypeScript)
bun run index.ts

# Using Node (need to compile first)
tsc && node dist/index.js

# Or use ts-node
npx ts-node index.ts
```

---

## Decorator Status

### Current Status: Experimental

⚠️ **Important:**
- Decorators are **not yet officially part of JavaScript**
- Currently at **Stage 3** in TC39 proposal process
- Expected to become standard in 2025-2026

### How to Use Now

**TypeScript:**
- Enable `experimentalDecorators` in tsconfig.json
- Use `reflect-metadata` library

**JavaScript:**
- Use Babel transpiler
- Configure decorator plugin

### Future: Native Support

When decorators become standard:
- No external libraries needed
- Slightly different syntax (simplified)
- Two parameters instead of three: `(context, ...)`

---

## Best Practices

### 1. Keep Decorators Simple

✅ **Good:**
```typescript
@log
@authorize('admin')
myMethod() { }
```

❌ **Avoid:**
```typescript
@complexDecoratorWithLotsOfLogic
myMethod() { }
```

### 2. Use Decorator Factories for Flexibility

```typescript
// ✅ Flexible
@role('admin', 'manager')

// ❌ Inflexible
@adminOnly
```

### 3. Maintain Method Context

Always use `.apply(this, args)`:

```typescript
descriptor.value = function(...args: unknown[]) {
  return originalMethod.apply(this, args); // ✅ Preserves 'this'
};
```

### 4. Return Values

Don't forget to return the result:

```typescript
descriptor.value = function(...args: unknown[]) {
  // Your logic
  return originalMethod.apply(this, args); // ✅ Return result
};
```

### 5. Type Safety

Use proper TypeScript types:

```typescript
function myDecorator(
  target: any,
  key: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  // ...
  return descriptor;
}
```

---

## Common Use Cases

### 1. Logging

```typescript
function log(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: unknown[]) {
    console.log(`Calling ${key} with`, args);
    const result = originalMethod.apply(this, args);
    console.log(`${key} returned:`, result);
    return result;
  };
}
```

### 2. Performance Monitoring

```typescript
function measureTime(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: unknown[]) {
    const start = performance.now();
    const result = originalMethod.apply(this, args);
    const end = performance.now();
    console.log(`${key} took ${end - start}ms`);
    return result;
  };
}
```

### 3. Caching/Memoization

```typescript
function memoize(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const cache = new Map();
  
  descriptor.value = function(...args: unknown[]) {
    const cacheKey = JSON.stringify(args);
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    
    const result = originalMethod.apply(this, args);
    cache.set(cacheKey, result);
    return result;
  };
}
```

### 4. Validation

```typescript
function validate(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: unknown[]) {
    // Validation logic
    if (!args[0] || typeof args[0] !== 'string') {
      throw new Error('Invalid argument');
    }
    
    return originalMethod.apply(this, args);
  };
}
```

### 5. Rate Limiting

```typescript
function rateLimit(callsPerMinute: number) {
  const calls: number[] = [];
  
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: unknown[]) {
      const now = Date.now();
      
      // Remove old calls
      while (calls.length && calls[0] < now - 60000) {
        calls.shift();
      }
      
      if (calls.length >= callsPerMinute) {
        throw new Error('Rate limit exceeded');
      }
      
      calls.push(now);
      return originalMethod.apply(this, args);
    };
  };
}
```

---

## Complete Working Example

```typescript
// index.ts
import 'reflect-metadata';

// Decorator: Logging
function log(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: unknown[]) {
    console.log(`[LOG] ${key} method called`);
    return originalMethod.apply(this, args);
  };
}

// Decorator: Authorization
function role(...allowedRoles: string[]) {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: unknown[]) {
      const request = args[0];
      
      if (!allowedRoles.includes(request.user.role)) {
        console.log(`[AUTH] Access denied to ${key}`);
        return;
      }
      
      console.log(`[AUTH] Access granted to ${key}`);
      return originalMethod.apply(this, args);
    };
  };
}

// Controller
class ProductController {
  @log
  @role('admin')
  create(request: any) {
    console.log('Product has been created');
  }
  
  @log
  @role('admin', 'manager')
  update(request: any) {
    console.log('Product has been updated');
  }
  
  @log
  @role('admin', 'manager', 'user')
  list(request: any) {
    console.log('Listing products');
  }
}

// Testing
const controller = new ProductController();

console.log('--- Admin User ---');
const adminReq = { user: { role: 'admin' } };
controller.create(adminReq);
controller.update(adminReq);
controller.list(adminReq);

console.log('\n--- Manager User ---');
const managerReq = { user: { role: 'manager' } };
controller.create(managerReq); // Denied
controller.update(managerReq); // Allowed
controller.list(managerReq);   // Allowed

console.log('\n--- Regular User ---');
const userReq = { user: { role: 'user' } };
controller.create(userReq);  // Denied
controller.update(userReq);  // Denied
controller.list(userReq);    // Allowed
```

**Output:**

```
--- Admin User ---
[AUTH] Access granted to create
[LOG] create method called
Product has been created

[AUTH] Access granted to update
[LOG] update method called
Product has been updated

[AUTH] Access granted to list
[LOG] list method called
Listing products

--- Manager User ---
[AUTH] Access denied to create

[AUTH] Access granted to update
[LOG] update method called
Product has been updated

[AUTH] Access granted to list
[LOG] list method called
Listing products

--- Regular User ---
[AUTH] Access denied to create
[AUTH] Access denied to update

[AUTH] Access granted to list
[LOG] list method called
Listing products
```

---

## Key Takeaways

### Core Concepts

1. **Decorators are functions** that modify behavior
2. **Use `@` symbol** to apply decorators
3. **Method decorators** receive: target, key, descriptor
4. **Wrap and replace** the original method
5. **Decorator factories** make decorators dynamic

### Benefits

✅ **Clean Code:** Declarative and self-documenting  
✅ **DRY Principle:** No code repetition  
✅ **Separation of Concerns:** Logic stays separate  
✅ **Reusability:** Write once, use everywhere  
✅ **Maintainability:** Easy to modify behavior

### Common Patterns

```typescript
// Simple decorator
@myDecorator
method() { }

// Decorator with parameters
@myDecorator('param1', 'param2')
method() { }

// Multiple decorators (execute bottom-up)
@decorator1
@decorator2
@decorator3
method() { }

// Decorator factory pattern
function myDecorator(...params) {
  return function(target, key, descriptor) {
    // Implementation
  };
}
```

---

## Frameworks Using Decorators

### NestJS (Heavily uses decorators)

```typescript
@Controller('users')
export class UserController {
  @Get()
  @UseGuards(AuthGuard)
  findAll() { }
  
  @Post()
  @Roles('admin')
  create() { }
}
```

### Angular

```typescript
@Component({
  selector: 'app-root',
  template: '<h1>Hello</h1>'
})
export class AppComponent { }
```

### TypeORM

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  name: string;
}
```

---

## Troubleshooting

### Error: Decorator not working

**Check:**
1. ✅ `experimentalDecorators: true` in tsconfig.json
2. ✅ `emitDecoratorMetadata: true` in tsconfig.json
3. ✅ `import 'reflect-metadata'` at top of file
4. ✅ `reflect-metadata` installed

### Error: Cannot find name 'PropertyDescriptor'

**Solution:** Update TypeScript version or use `any`:

```typescript
function myDecorator(
  target: any,
  key: string,
  descriptor: any // Use 'any' if PropertyDescriptor not found
) {
  // ...
}
```

### Decorators execute at wrong time

**Remember:** Decorators execute when the **class is defined**, not when methods are called.

---

## Further Learning

### Next Steps

1. **Explore class decorators** for modifying classes
2. **Learn property decorators** for class properties
3. **Study parameter decorators** for method parameters
4. **Understand metadata** with `reflect-metadata`
5. **Build real applications** with NestJS

### Related Topics

- Metadata Reflection API
- Dependency Injection
- Aspect-Oriented Programming (AOP)
- Design Patterns

---

## Conclusion

Decorators are powerful tools for:
- **Meta-programming:** Modify code behavior at design time
- **Cross-cutting concerns:** Authentication, logging, caching
- **Framework development:** Build elegant APIs

### The Core Idea

> Decorators = Functions that wrap and enhance other functions

### Simple Formula

```
Original Method
     ↓
  Wrap it
     ↓
  Add behavior
     ↓
  Replace original
     ↓
Enhanced Method
```

---

**Source:** Codsज्ञान Channel by Rakesh  
**For NestJS examples:** Check the NestJS crash course video (link in description)

**Remember:** Decorators are coming soon to native JavaScript. Learning them now prepares you for the future!