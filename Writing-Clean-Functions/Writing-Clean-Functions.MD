# Clean Code: Writing Clean Functions

## Introduction

Based on **"Clean Code"** by **Uncle Bob (Robert C. Martin)**, this guide covers 5 essential practices for writing clean, maintainable functions. These practices are **language-agnostic** and can be applied to JavaScript, Go, Java, Python, or any programming language.

---

## Core Philosophy

> **Your code should be written for humans to read, not just for computers to execute.**

### Success Metrics:
- ✅ Another developer can easily understand your code
- ✅ Code is self-documenting
- ✅ Intent is clear without extensive comments
- ✅ Maintenance is straightforward

---

## Table of Contents

1. [Function Naming](#1-function-naming)
2. [Limit Number of Parameters](#2-limit-number-of-parameters)
3. [Return Early](#3-return-early)
4. [Avoid Boolean Flags](#4-avoid-boolean-flags)
5. [Single Level of Abstraction](#5-single-level-of-abstraction)
6. [Bonus: Functions Should Tell Stories](#bonus-functions-should-tell-stories)

---

## 1. Function Naming

### ❌ Bad Practice: Using Nouns or Adjectives

```javascript
// BAD - Noun-based naming
function product() {
  // What does this do? Get? Create? Update? Delete?
  // No idea!
}

// BAD - Adjective-based naming
function freshProduct() {
  // Still unclear what action is being performed
}
```

**Problem**: No indication of what action the function performs.

### ✅ Good Practice: Use Verbs/Actions

```javascript
// GOOD - Verb-based naming
function fetchProduct() {
  // Clear: This function fetches/retrieves a product
}

function createProduct() {
  // Clear: This function creates a new product
}

function updateProduct() {
  // Clear: This function updates an existing product
}

function deleteProduct() {
  // Clear: This function deletes a product
}
```

### Consistency is Key

#### ❌ Inconsistent Naming

```javascript
// BAD - Mixing different verbs for same action
function fetchProduct() { /* ... */ }
function getUser() { /* ... */ }  // Inconsistent!

function createProduct() { /* ... */ }
function insertUser() { /* ... */ }  // Inconsistent!
```

**Problem**: Developers have to remember different verbs for the same type of operation.

#### ✅ Consistent Naming

```javascript
// GOOD - Consistent verb usage
function fetchProduct() { /* ... */ }
function fetchUser() { /* ... */ }     // Consistent!
function fetchOrder() { /* ... */ }    // Consistent!

function createProduct() { /* ... */ }
function createUser() { /* ... */ }    // Consistent!
function createOrder() { /* ... */ }   // Consistent!
```

### Common Verb Patterns

| Operation | Recommended Verbs | Avoid |
|-----------|------------------|-------|
| **Retrieve data** | `fetch`, `get`, `find` | `retrieve`, `obtain` |
| **Create** | `create`, `add`, `insert` | `make`, `new` |
| **Update** | `update`, `edit`, `modify` | `change`, `alter` |
| **Delete** | `delete`, `remove` | `destroy`, `erase` |
| **Validate** | `validate`, `check`, `verify` | `test`, `ensure` |

**Rule**: Pick one verb per action type and use it consistently across your entire codebase.

---

## 2. Limit Number of Parameters

### ❌ Bad Practice: Too Many Parameters

```javascript
// BAD - 6 parameters!
function createProduct(
  title,
  description,
  price,
  quantity,
  category,
  image
) {
  // Implementation
}

// Calling the function
createProduct(
  'Laptop',
  'High-performance laptop',
  1200,
  50,
  'Electronics',
  'laptop.jpg'
);
```

**Problems**:
1. ❌ Hard to remember parameter order
2. ❌ Easy to mix up similar parameters (category vs image)
3. ❌ Leads to bugs (data corruption in database)
4. ❌ Difficult to maintain
5. ❌ Poor readability

### ✅ Good Practice: Use Object Parameter

```javascript
// GOOD - Single object parameter
function createProduct(product) {
  const { title, description, price, quantity, category, image } = product;
  // Implementation
}

// Calling the function
createProduct({
  title: 'Laptop',
  description: 'High-performance laptop',
  price: 1200,
  quantity: 50,
  category: 'Electronics',
  image: 'laptop.jpg'
});
```

**Benefits**:
- ✅ Order doesn't matter
- ✅ Self-documenting (property names are clear)
- ✅ Easy to add/remove properties
- ✅ No risk of parameter confusion
- ✅ Better readability

### The Rule

**Maximum 2-3 parameters**. If you need more, use an object.

```javascript
// ✅ Acceptable - 2 parameters
function updateUserEmail(userId, newEmail) { /* ... */ }

// ✅ Acceptable - 3 parameters (edge case)
function calculateDistance(x1, y1, x2, y2) { /* ... */ }

// ❌ Too many - use object instead
function createUser(name, email, password, age, country, city, zipCode) { 
  /* ... */ 
}

// ✅ Better
function createUser(userData) {
  const { name, email, password, age, address } = userData;
  const { country, city, zipCode } = address;
  /* ... */
}
```

---

## 3. Return Early

### ❌ Bad Practice: Nested If-Else Statements

```javascript
// BAD - Deeply nested conditions
function registerUser(user) {
  if (user.age >= 18) {
    // More logic here...
    if (!alreadyExists(user)) {
      // Register user logic
      // Even more nesting possible...
    }
  }
}
```

**Problems**:
1. ❌ Hard to read (cognitive load)
2. ❌ Difficult to track which closing brace belongs where
3. ❌ Poor maintainability
4. ❌ Easy to introduce bugs

### ✅ Good Practice: Return Early (Guard Clauses)

```javascript
// GOOD - Early returns with guard clauses
function registerUser(user) {
  // Guard clause 1: Check age
  if (user.age < 18) {
    return; // Or throw error
  }
  
  // Guard clause 2: Check if already exists
  if (alreadyExists(user)) {
    return; // Or throw error
  }
  
  // Main logic - no nesting!
  // Register user...
}
```

### The Pattern

**Invert your conditions** and return early when requirements aren't met.

#### Before (Nested):
```javascript
function processOrder(order) {
  if (order.isValid) {
    if (order.isPaid) {
      if (order.inStock) {
        // Process order
        shipOrder(order);
      }
    }
  }
}
```

#### After (Early Returns):
```javascript
function processOrder(order) {
  if (!order.isValid) return;
  if (!order.isPaid) return;
  if (!order.inStock) return;
  
  // Process order - clean and flat
  shipOrder(order);
}
```

### Benefits

- ✅ **Flat structure** - no deep nesting
- ✅ **Clear preconditions** - requirements are obvious
- ✅ **Easier to read** - happy path is at the bottom
- ✅ **Maintainable** - easy to add new conditions

### With Error Messages

```javascript
function registerUser(user) {
  if (user.age < 18) {
    throw new Error('User must be 18 or older');
  }
  
  if (alreadyExists(user)) {
    throw new Error('User already exists');
  }
  
  if (!user.email || !user.password) {
    throw new Error('Email and password are required');
  }
  
  // Clean, readable main logic
  const hashedPassword = hashPassword(user.password);
  const newUser = createUser({ ...user, password: hashedPassword });
  return newUser;
}
```

---

## 4. Avoid Boolean Flags

### ❌ Bad Practice: Boolean Flags in Parameters

```javascript
// BAD - What does 'true' mean?
function registerUser(user, true) {
  // Implementation
}

registerUser(userData, true);  // What is true? No idea!
registerUser(userData, false); // What is false? No idea!
```

**Problem**: Boolean parameters are not self-documenting. The intent is unclear.

### Another Example:

```javascript
// BAD - Boolean flag
function registerUser(user, shouldReturnToken) {
  // Register user logic
  const newUser = { name: 'codersgyan' };
  
  if (shouldReturnToken) {
    newUser.token = generateToken();
  }
  
  return newUser;
}

// Calling - unclear intent
registerUser(userData, true);  // Why true?
```

### ✅ Good Practice: Use Named Constants or Enums

#### Solution 1: Named Constants (JavaScript)

```javascript
// GOOD - Named constant
const SHOULD_RETURN_TOKEN = true;

function registerUser(user, shouldReturnToken) {
  const newUser = { name: 'codersgyan' };
  
  if (shouldReturnToken) {
    newUser.token = generateToken();
  }
  
  return newUser;
}

// Calling - crystal clear
registerUser(userData, SHOULD_RETURN_TOKEN);
```

#### Solution 2: Enum (TypeScript)

```typescript
// EXCELLENT - Using enum
enum TokenOption {
  WITH_TOKEN,
  WITHOUT_TOKEN
}

function registerUser(user: User, tokenOption: TokenOption) {
  const newUser = { name: user.name };
  
  if (tokenOption === TokenOption.WITH_TOKEN) {
    newUser.token = generateToken();
  }
  
  return newUser;
}

// Calling - extremely clear
registerUser(userData, TokenOption.WITH_TOKEN);
registerUser(userData, TokenOption.WITHOUT_TOKEN);
```

#### Solution 3: Object with Named Properties

```javascript
// GOOD - Object with named properties
function registerUser(user, options = {}) {
  const { returnToken = false } = options;
  
  const newUser = { name: user.name };
  
  if (returnToken) {
    newUser.token = generateToken();
  }
  
  return newUser;
}

// Calling - self-documenting
registerUser(userData, { returnToken: true });
```

#### Solution 4: Separate Functions (Best for simple cases)

```javascript
// EXCELLENT - Most explicit
function registerUser(user) {
  return createUser(user);
}

function registerUserWithToken(user) {
  const newUser = createUser(user);
  newUser.token = generateToken();
  return newUser;
}

// Calling - intent is obvious
registerUser(userData);
registerUserWithToken(userData);
```

### Benefits

- ✅ **Self-documenting** - intent is clear
- ✅ **IDE support** - hover shows value
- ✅ **Type-safe** (in TypeScript)
- ✅ **Maintainable** - easy to add new options

---

## 5. Single Level of Abstraction

### ❌ Bad Practice: Multiple Levels of Abstraction

```javascript
// BAD - Everything in one function
function createUser(req, res) {
  // Getting request body (low-level detail)
  const body = req.body;
  
  // Validation logic (business logic)
  if (!body.name || !body.email || !body.password) {
    return res.status(400).json({ message: 'All fields required' });
  }
  
  // Password hashing (implementation detail)
  const hashedPassword = bcrypt.hashSync(body.password, 10);
  
  // Database query (infrastructure)
  const user = await db.users.create({
    name: body.name,
    email: body.email,
    password: hashedPassword
  });
  
  // Response (presentation)
  res.status(201).json({ message: 'User created', user });
}
```

**Problems**:
1. ❌ Mixes different concerns (validation, hashing, database, response)
2. ❌ Hard to test individual pieces
3. ❌ Difficult to reuse logic
4. ❌ Hard to maintain and debug
5. ❌ Violates Single Responsibility Principle

### ✅ Good Practice: Extract to Functions (Single Level of Abstraction)

```javascript
// GOOD - Separated concerns

// 1. Validation function
function validateUser(user) {
  if (!user.name || !user.email || !user.password) {
    throw new Error('All fields are required');
  }
  
  // Additional validation logic
  if (!isValidEmail(user.email)) {
    throw new Error('Invalid email format');
  }
  
  return user; // Return sanitized user
}

// 2. User service (business logic)
async function createUserInDb(user) {
  const hashedPassword = await hashPassword(user.password);
  
  const newUser = await db.users.create({
    name: user.name,
    email: user.email,
    password: hashedPassword
  });
  
  if (!newUser) {
    throw new Error('Failed to store in DB');
  }
  
  return newUser;
}

// 3. Controller (orchestration only)
async function createUser(req, res) {
  try {
    // Single level of abstraction - all high-level operations
    const body = req.body;
    const validatedUser = validateUser(body);
    const newUser = await createUserInDb(validatedUser);
    
    res.status(201).json({ 
      message: 'User created', 
      user: newUser 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed', 
      error: error.message 
    });
  }
}
```

### The Rule

**Each function should operate at a single level of abstraction.**

```
High Level:    createUser() orchestrates the flow
                    ↓
Medium Level:  validateUser(), createUserInDb()
                    ↓
Low Level:     hashPassword(), db.users.create()
```

### Benefits

- ✅ **Separation of Concerns** - each function has one job
- ✅ **Testable** - easy to unit test each piece
- ✅ **Reusable** - validation can be used elsewhere
- ✅ **Readable** - main function reads like English
- ✅ **Maintainable** - changes are isolated

### Real-World Example

#### Before:
```javascript
function processPayment(order) {
  // Validate order
  if (!order.items || order.items.length === 0) {
    throw new Error('Cart is empty');
  }
  
  // Calculate total
  let total = 0;
  for (let item of order.items) {
    total += item.price * item.quantity;
  }
  
  // Apply discount
  if (order.coupon) {
    const discount = calculateDiscount(order.coupon);
    total -= discount;
  }
  
  // Process payment
  const paymentResult = stripe.charge({
    amount: total,
    currency: 'usd',
    source: order.paymentMethod
  });
  
  // Update inventory
  for (let item of order.items) {
    db.inventory.update({
      id: item.id,
      quantity: item.currentQuantity - item.quantity
    });
  }
  
  return paymentResult;
}
```

#### After (Single Level of Abstraction):
```javascript
function processPayment(order) {
  validateOrder(order);
  const total = calculateTotal(order);
  const finalAmount = applyDiscounts(total, order.coupon);
  const paymentResult = chargePayment(finalAmount, order.paymentMethod);
  updateInventory(order.items);
  
  return paymentResult;
}

// Each extracted function handles one concern
function validateOrder(order) { /* ... */ }
function calculateTotal(order) { /* ... */ }
function applyDiscounts(total, coupon) { /* ... */ }
function chargePayment(amount, method) { /* ... */ }
function updateInventory(items) { /* ... */ }
```

**Notice**: The main function now reads like a story!

---

## Bonus: Functions Should Tell Stories

### ❌ Bad Practice: Generic Names

```javascript
// BAD - What does this do?
function handleData(users) {
  return users.filter(user => user.active);
}

// Calling it
const result = handleData(allUsers);
// What is 'result'? What did 'handleData' do?
```

**Problem**: Function name doesn't describe what it actually does.

### ✅ Good Practice: Descriptive Names

```javascript
// GOOD - Tells exactly what it does
function filterActiveUsers(users) {
  return users.filter(user => user.active);
}

// Calling it
const activeUsers = filterActiveUsers(allUsers);
// Crystal clear what happened!
```

### More Examples

#### Generic → Specific

```javascript
// ❌ Generic
function process(data) { /* ... */ }
function handle(items) { /* ... */ }
function doStuff(params) { /* ... */ }

// ✅ Specific
function calculateMonthlyRevenue(transactions) { /* ... */ }
function sortProductsByPrice(products) { /* ... */ }
function sendWelcomeEmail(user) { /* ... */ }
```

### The Story Test

**Can you read the function calls like an English sentence?**

#### ❌ Poor Story:
```javascript
const data = process(items);
const result = handle(data);
const final = transform(result);
```
*Unclear what's happening at each step.*

#### ✅ Good Story:
```javascript
const validOrders = filterValidOrders(orders);
const processedOrders = applyDiscounts(validOrders);
const invoices = generateInvoices(processedOrders);
```
*Reads like a story - clear flow of operations.*

### Real-World Examples

```javascript
// E-commerce
function filterInStockProducts(products) { /* ... */ }
function calculateCartTotal(cartItems) { /* ... */ }
function applyPromoCode(total, promoCode) { /* ... */ }

// User Management
function findUserByEmail(email) { /* ... */ }
function deactivateExpiredAccounts(accounts) { /* ... */ }
function sendPasswordResetEmail(user) { /* ... */ }

// Data Processing
function removeDuplicateEntries(entries) { /* ... */ }
function groupOrdersByCustomer(orders) { /* ... */ }
function calculateAverageRating(reviews) { /* ... */ }
```

---

## Complete Example: Before & After

### ❌ Before (Bad Practices)

```javascript
// Multiple issues: bad naming, too many parameters, no abstraction
function prod(t, d, p, q, c, i) {
  if (t && d && p && q && c && i) {
    if (p > 0) {
      if (q > 0) {
        // Create product logic
        const result = db.save(t, d, p, q, c, i);
        return result;
      }
    }
  }
}
```

### ✅ After (Clean Code)

```javascript
// 1. Good naming with verb
// 2. Single object parameter
// 3. Early returns
// 4. Single level of abstraction
function createProduct(product) {
  // Guard clauses (early return)
  validateProduct(product);
  validatePrice(product.price);
  validateQuantity(product.quantity);
  
  // Single level of abstraction
  const newProduct = saveProductToDatabase(product);
  
  return newProduct;
}

// Helper functions
function validateProduct(product) {
  const requiredFields = ['title', 'description', 'price', 'quantity', 'category', 'image'];
  
  for (const field of requiredFields) {
    if (!product[field]) {
      throw new Error(`${field} is required`);
    }
  }
}

function validatePrice(price) {
  if (price <= 0) {
    throw new Error('Price must be greater than 0');
  }
}

function validateQuantity(quantity) {
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }
}

async function saveProductToDatabase(product) {
  try {
    return await db.products.create(product);
  } catch (error) {
    throw new Error('Failed to save product');
  }
}
```

---

## Quick Reference Checklist

### Before Writing a Function, Ask:

- [ ] **Is the name a verb/action?** (fetchUser, not user)
- [ ] **Is naming consistent with similar functions?** (all use fetch/get/create)
- [ ] **Does it have 2-3 or fewer parameters?** (use object if more)
- [ ] **Does it return early on invalid conditions?** (guard clauses)
- [ ] **Are there boolean flags?** (use constants/enums instead)
- [ ] **Does it do only one thing?** (single responsibility)
- [ ] **Is it at a single level of abstraction?** (extract sub-operations)
- [ ] **Does the name tell a story?** (clear what it does)

---

## Summary

### The 5 Principles

| Principle | Rule | Example |
|-----------|------|---------|
| **1. Function Naming** | Use verbs, be consistent | `fetchUser()` not `user()` |
| **2. Limit Parameters** | Max 2-3, use objects for more | `create(product)` not `create(a,b,c,d,e)` |
| **3. Return Early** | Guard clauses, avoid nesting | `if (!valid) return;` |
| **4. Avoid Boolean Flags** | Use named constants/enums | `SHOULD_RETURN_TOKEN` not `true` |
| **5. Single Abstraction** | One level per function | Extract sub-operations |
| **Bonus: Tell Stories** | Descriptive names | `filterActiveUsers` not `handleData` |

### Key Takeaway

> **Write code for humans first, computers second.**

Clean functions are:
- ✅ Easy to read
- ✅ Easy to understand
- ✅ Easy to maintain
- ✅ Easy to test
- ✅ Self-documenting

---

## Further Learning

### Recommended Reading
- **"Clean Code"** by Robert C. Martin (Uncle Bob)
- **"The Pragmatic Programmer"** by Hunt & Thomas
- **"Code Complete"** by Steve McConnell

### Related Topics
- Error Handling Best Practices
- SOLID Principles
- Design Patterns
- Test-Driven Development (TDD)
- Refactoring Techniques

---

## Practice Exercise

Refactor this function using all 5 principles:

```javascript
// TODO: Apply all 5 clean code principles
function x(a, b, c, d, e, f, g) {
  if (a) {
    if (b > 0) {
      if (c) {
        if (!d) {
          // Do something
          const result = { ...e };
          if (f) {
            result.token = generateToken();
          }
          return result;
        }
      }
    }
  }
}
```

**Your turn!** Apply the principles you've learned.

---

**Happy Coding! 🚀**

*Remember: Clean code is not written in one pass. It's crafted through continuous refactoring.*