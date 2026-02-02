# Event-Driven Architecture in Node.js - Complete Implementation Guide

## Table of Contents
- [Introduction](#introduction)
- [The Problem: Tight Coupling](#the-problem-tight-coupling)
- [The Solution: Event-Driven Architecture](#the-solution-event-driven-architecture)
- [Understanding Event Emitter](#understanding-event-emitter)
- [Practical Implementation](#practical-implementation)
- [Architecture Patterns](#architecture-patterns)
- [Best Practices](#best-practices)
- [Distributed Systems](#distributed-systems)

---

## Introduction

> "Much of the Node.js core API is built around an idiomatic asynchronous event-driven architecture."
> — Node.js Documentation

### What You'll Learn

This guide covers how to implement Event-Driven Architecture in Node.js applications to:
- **Decouple modules** - Remove tight dependencies between services
- **Improve maintainability** - Make code easier to maintain and extend
- **Handle complex use cases** - Implement sophisticated workflows elegantly
- **Scale applications** - Build systems that grow without becoming unmaintainable

### Why Event-Driven Architecture?

Event-Driven Architecture helps solve the **tight coupling problem** that occurs when modules directly depend on each other. By using events, modules communicate without knowing about each other's implementation details.

---

## The Problem: Tight Coupling

### Traditional Approach (Tightly Coupled)

Let's consider an e-commerce application with an order creation feature.

#### System Flow

```
User
  ↓
Request: Create Order
  ↓
Controller
  ↓
Order Service
  ├─→ Email Service (send email)
  └─→ Inventory Service (update inventory)
```

#### Code Example (Problematic)

```javascript
// order.service.js
import EmailService from './email.service.js';
import InventoryService from './inventory.service.js';

class OrderService {
  constructor(emailService, inventoryService) {
    this.emailService = emailService;
    this.inventoryService = inventoryService;
  }

  createOrder(orderData) {
    // 1. Process order - save to database
    const order = {
      id: Date.now().toString(),
      ...orderData
    };

    // 2. Send email (TIGHTLY COUPLED)
    this.emailService.sendEmail(orderData);

    // 3. Update inventory (TIGHTLY COUPLED)
    this.inventoryService.updateInventory(orderData);

    return order;
  }
}
```

### Problems with This Approach

1. **Tight Coupling**
   - OrderService directly depends on EmailService and InventoryService
   - Must import both services
   - Changes in one service affect others

2. **Hard to Maintain**
   - Adding new functionality requires modifying OrderService
   - Difficult to test in isolation
   - Growing complexity as features increase

3. **Lack of Flexibility**
   - Cannot easily add/remove features
   - Difficult to reorder operations
   - Hard to make operations optional

4. **Poor Scalability**
   - All operations happen in sequence
   - No easy way to handle failures independently
   - Difficult to optimize individual operations

---

## The Solution: Event-Driven Architecture

### Event-Driven Approach (Loosely Coupled)

Instead of directly calling services, we **emit events** and let interested parties **subscribe** to them.

#### New System Flow

```
User
  ↓
Request: Create Order
  ↓
Controller
  ↓
Order Service
  ↓
Emit Event: "order:created"
  ↓
Event Emitter
  ├─→ Subscriber 1 → Email Service
  └─→ Subscriber 2 → Inventory Service
```

### Key Concepts

#### 1. Event Emitter
- A class that can **emit events**
- Notifies all registered listeners when an event occurs
- Built into Node.js (`events` module)

#### 2. Events
- Named notifications (e.g., "order:created", "payment:done")
- Can carry data (payload)
- Triggered when something significant happens

#### 3. Subscribers/Listeners
- Functions that **listen** for specific events
- Execute when their event is emitted
- Multiple subscribers can listen to the same event

### Benefits

✅ **Decoupled Modules** - Services don't know about each other  
✅ **Easy to Extend** - Add new subscribers without modifying existing code  
✅ **Better Testing** - Test each component independently  
✅ **Flexible** - Easy to add/remove features  
✅ **Maintainable** - Changes in one module don't affect others  

---

## Understanding Event Emitter

### What is EventEmitter?

EventEmitter is a built-in Node.js class that provides:
- Ability to emit named events
- Ability to register listeners for events
- Automatic notification of all listeners when an event occurs

### Core Methods

#### 1. `emit(eventName, ...args)`
**Purpose:** Trigger an event  
**Behavior:** Synchronously calls all registered listeners

```javascript
this.emit('order:created', orderData);
```

#### 2. `on(eventName, callback)`
**Purpose:** Register a listener for an event  
**Behavior:** Callback executes when event is emitted

```javascript
emitter.on('order:created', (data) => {
  console.log('Order created:', data);
});
```

#### 3. `once(eventName, callback)`
**Purpose:** Register a one-time listener  
**Behavior:** Callback executes once, then is removed

```javascript
emitter.once('order:created', (data) => {
  // Only runs for the first order
});
```

#### 4. `removeListener(eventName, callback)`
**Purpose:** Unregister a specific listener

```javascript
const handler = (data) => console.log(data);
emitter.on('order:created', handler);
emitter.removeListener('order:created', handler);
```

### How to Use EventEmitter

#### Method 1: Extend EventEmitter

```javascript
import EventEmitter from 'node:events';

class OrderService extends EventEmitter {
  createOrder(orderData) {
    // Process order
    const order = { id: Date.now().toString(), ...orderData };
    
    // Emit event
    this.emit('order:created', order);
    
    return order;
  }
}
```

#### Method 2: Composition

```javascript
import EventEmitter from 'node:events';

class OrderService {
  constructor() {
    this.events = new EventEmitter();
  }

  createOrder(orderData) {
    const order = { id: Date.now().toString(), ...orderData };
    this.events.emit('order:created', order);
    return order;
  }
}
```

---

## Practical Implementation

### Complete E-Commerce Example

Let's build a complete order management system using Event-Driven Architecture.

### Project Structure

```
project/
├── app.js                    # Main application
├── order.controller.js       # Handles HTTP requests
├── order.service.js          # Business logic + EventEmitter
├── email.service.js          # Email functionality
└── inventory.service.js      # Inventory management
```

---

### Step 1: Create Email Service

**File:** `email.service.js`

```javascript
export class EmailService {
  sendEmail(orderData) {
    // In production, this would use nodemailer, SendGrid, etc.
    console.log('Sending email for order:', orderData);
    console.log('Email sent to:', orderData.customerEmail);
  }
}
```

**Purpose:**
- Handles email sending logic
- Independent of other services
- Can be replaced/upgraded without affecting others

---

### Step 2: Create Inventory Service

**File:** `inventory.service.js`

```javascript
export class InventoryService {
  updateInventory(orderData) {
    // In production, this would update database
    console.log('Updating inventory for order:', orderData);
    console.log('Product:', orderData.product, 'Quantity:', orderData.quantity);
  }
}
```

**Purpose:**
- Manages inventory updates
- Independent service
- Can have its own database, logic, etc.

---

### Step 3: Create Order Service (Event Emitter)

**File:** `order.service.js`

```javascript
import EventEmitter from 'node:events';

export class OrderService extends EventEmitter {
  createOrder(orderData) {
    // 1. Process the order (save to database, etc.)
    const order = {
      id: Date.now().toString(),
      ...orderData,
      status: 'created',
      createdAt: new Date()
    };

    console.log('Order processed:', order);

    // 2. Emit event instead of directly calling services
    this.emit('order:created', order);

    // 3. Return the created order
    return order;
  }
}
```

**Key Points:**
- Extends EventEmitter to gain event capabilities
- NO imports of EmailService or InventoryService
- Simply emits an event after processing
- Completely decoupled from other services

---

### Step 4: Create Controller

**File:** `order.controller.js`

```javascript
export class OrderController {
  constructor(orderService) {
    this.orderService = orderService;
  }

  create(req, res) {
    const orderData = req.body;
    const order = this.orderService.createOrder(orderData);
    
    return res.json({
      message: 'Order created',
      order
    });
  }
}
```

**Purpose:**
- Handles HTTP requests
- Delegates to OrderService
- Returns response to client

---

### Step 5: Wire Everything Together

**File:** `app.js`

```javascript
import express from 'express';
import { OrderController } from './order.controller.js';
import { OrderService } from './order.service.js';
import { EmailService } from './email.service.js';
import { InventoryService } from './inventory.service.js';

const app = express();
app.use(express.json());

// ============================================
// DEPENDENCY INITIALIZATION
// ============================================

const emailService = new EmailService();
const inventoryService = new InventoryService();
const orderService = new OrderService();
const orderController = new OrderController(orderService);

// ============================================
// REGISTER EVENT LISTENERS (Subscribers)
// ============================================

// Subscriber 1: Send email when order is created
orderService.on('order:created', (orderData) => {
  emailService.sendEmail(orderData);
});

// Subscriber 2: Update inventory when order is created
orderService.on('order:created', (orderData) => {
  inventoryService.updateInventory(orderData);
});

// ============================================
// ROUTES
// ============================================

app.post('/orders', (req, res) => orderController.create(req, res));

// ============================================
// START SERVER
// ============================================

const PORT = 4500;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
```

---

### Step 6: Test the Application

#### Start the Server

```bash
node --watch app.js
```

#### Make a Request

```bash
# Using curl
curl -X POST http://localhost:4500/orders \
  -H "Content-Type: application/json" \
  -d '{
    "product": "Laptop",
    "quantity": 1,
    "customerEmail": "user@example.com"
  }'
```

#### Expected Output

**Terminal:**
```
Server listening on port 4500
Order processed: { id: '1234567890', product: 'Laptop', ... }
Sending email for order: { id: '1234567890', product: 'Laptop', ... }
Updating inventory for order: { id: '1234567890', product: 'Laptop', ... }
```

**HTTP Response:**
```json
{
  "message": "Order created",
  "order": {
    "id": "1234567890",
    "product": "Laptop",
    "quantity": 1,
    "status": "created"
  }
}
```

---

## Architecture Patterns

### Publisher-Subscriber Pattern

Event-Driven Architecture implements the **Pub-Sub pattern**:

```
Publisher (OrderService)
    ↓
  emit('order:created')
    ↓
Event Emitter
    ├─→ Subscriber 1 (EmailService)
    ├─→ Subscriber 2 (InventoryService)
    └─→ Subscriber 3 (AnalyticsService)
```

**Characteristics:**
- Publishers don't know about subscribers
- Subscribers don't know about publishers
- Many-to-many relationship possible
- Loose coupling between components

### Observer Pattern

Event-Driven Architecture also implements the **Observer pattern**:

**Subject (Observable):** The EventEmitter  
**Observers:** The registered listeners  
**Notification:** Event emission

```javascript
// Subject notifies all observers
subject.emit('change', data);

// Observers react to notifications
subject.on('change', observer1);
subject.on('change', observer2);
```

---

## Best Practices

### 1. Event Naming Conventions

Use clear, descriptive event names:

**Good:**
```javascript
this.emit('order:created', order);
this.emit('payment:completed', payment);
this.emit('user:registered', user);
this.emit('inventory:updated', item);
```

**Bad:**
```javascript
this.emit('done', data);          // Too vague
this.emit('thing', data);         // Unclear
this.emit('event1', data);        // Non-descriptive
```

**Convention:**
- Use `resource:action` format
- Use past tense for completed actions
- Be specific and descriptive

### 2. Event Data (Payload)

Always send relevant data with events:

```javascript
// Good - Complete information
this.emit('order:created', {
  orderId: order.id,
  customerId: order.customerId,
  total: order.total,
  items: order.items
});

// Bad - Missing context
this.emit('order:created', order.id);  // Just ID
```

### 3. Error Handling

Handle errors in event listeners:

```javascript
orderService.on('order:created', async (orderData) => {
  try {
    await emailService.sendEmail(orderData);
  } catch (error) {
    console.error('Failed to send email:', error);
    // Emit error event for logging/monitoring
    orderService.emit('order:email:failed', {
      orderData,
      error: error.message
    });
  }
});
```

### 4. Synchronous vs Asynchronous

**Important:** EventEmitter executes listeners **synchronously**:

```javascript
console.log('Before emit');
this.emit('order:created', data);
console.log('After emit');

// Output:
// Before emit
// [All listeners execute here]
// After emit
```

**For Async Operations:**

Make the listener async, but understand it still blocks:

```javascript
orderService.on('order:created', async (data) => {
  // This is async, but still blocks the emit call
  await emailService.sendEmail(data);
});
```

**For True Non-Blocking:**

Use `setImmediate` or `process.nextTick`:

```javascript
orderService.on('order:created', (data) => {
  setImmediate(async () => {
    await emailService.sendEmail(data);
  });
});
```

### 5. Organize Listeners

Keep listener registration organized:

**Option 1: Central Registration (Shown in Example)**

```javascript
// app.js
orderService.on('order:created', (data) => emailService.sendEmail(data));
orderService.on('order:created', (data) => inventoryService.updateInventory(data));
```

**Option 2: Service Self-Registration**

```javascript
// email.service.js
export class EmailService {
  constructor(orderEmitter) {
    // Register itself as a listener
    orderEmitter.on('order:created', this.sendEmail.bind(this));
  }

  sendEmail(orderData) {
    console.log('Sending email:', orderData);
  }
}

// app.js
const orderService = new OrderService();
const emailService = new EmailService(orderService);
```

### 6. Event Documentation

Document your events:

```javascript
/**
 * OrderService Events
 * 
 * @event order:created
 * @param {Object} orderData
 * @param {string} orderData.id - Order ID
 * @param {string} orderData.customerId - Customer ID
 * @param {number} orderData.total - Order total
 * 
 * @event order:cancelled
 * @param {Object} orderData
 * @param {string} orderData.id - Order ID
 * @param {string} orderData.reason - Cancellation reason
 */
class OrderService extends EventEmitter {
  // ...
}
```

### 7. Avoid Event Chains

Don't create complex chains of events triggering events:

**Bad:**
```javascript
// Event triggers another event triggers another...
orderService.on('order:created', (data) => {
  paymentService.emit('payment:required', data);
});

paymentService.on('payment:required', (data) => {
  billingService.emit('invoice:generate', data);
});

// Hard to follow, debug, and maintain
```

**Good:**
```javascript
// Clear, direct event handling
orderService.on('order:created', (data) => {
  paymentService.processPayment(data);
  billingService.generateInvoice(data);
});
```

### 8. Memory Leaks

Be careful with event listeners to avoid memory leaks:

```javascript
// Problem: Adding listener in a loop
for (let i = 0; i < 1000; i++) {
  orderService.on('order:created', handler);  // Creates 1000 listeners!
}

// Solution: Add listener once
orderService.on('order:created', handler);

// Or use once() for one-time listeners
orderService.once('order:created', handler);

// Or remove when done
orderService.removeListener('order:created', handler);
```

---

## Advanced Patterns

### 1. Multiple Event Types

Handle different stages of a process:

```javascript
class OrderService extends EventEmitter {
  createOrder(orderData) {
    // Emit: Order validation started
    this.emit('order:validating', orderData);

    // Validate
    const valid = this.validate(orderData);
    if (!valid) {
      this.emit('order:validation:failed', orderData);
      return null;
    }

    // Process
    const order = this.processOrder(orderData);
    this.emit('order:created', order);

    // Payment
    this.processPayment(order);
    this.emit('order:payment:processing', order);

    return order;
  }
}

// Different listeners for different stages
orderService.on('order:validating', logValidation);
orderService.on('order:validation:failed', handleError);
orderService.on('order:created', sendEmail);
orderService.on('order:payment:processing', updateDashboard);
```

### 2. Event Namespacing

Organize events by domain:

```javascript
// Order events
orderService.emit('order:created', data);
orderService.emit('order:updated', data);
orderService.emit('order:cancelled', data);

// Payment events
paymentService.emit('payment:initiated', data);
paymentService.emit('payment:completed', data);
paymentService.emit('payment:failed', data);

// User events
userService.emit('user:registered', data);
userService.emit('user:login', data);
userService.emit('user:logout', data);
```

### 3. Event Aggregation

Combine multiple events:

```javascript
class OrderAggregator extends EventEmitter {
  constructor() {
    super();
    this.orderStatus = {};
  }

  trackOrder(orderId) {
    this.orderStatus[orderId] = {
      created: false,
      paid: false,
      shipped: false
    };
  }

  updateStatus(orderId, status) {
    this.orderStatus[orderId][status] = true;

    // Check if all steps complete
    const order = this.orderStatus[orderId];
    if (order.created && order.paid && order.shipped) {
      this.emit('order:completed', { orderId });
    }
  }
}

const aggregator = new OrderAggregator();
aggregator.trackOrder('123');

orderService.on('order:created', (data) => {
  aggregator.updateStatus(data.id, 'created');
});

paymentService.on('payment:completed', (data) => {
  aggregator.updateStatus(data.orderId, 'paid');
});

shippingService.on('shipment:dispatched', (data) => {
  aggregator.updateStatus(data.orderId, 'shipped');
});

// Listen for complete order
aggregator.on('order:completed', ({ orderId }) => {
  console.log(`Order ${orderId} is complete!`);
});
```

### 4. Event Filtering

Filter events before processing:

```javascript
class FilteredOrderService extends EventEmitter {
  createOrder(orderData) {
    const order = this.processOrder(orderData);

    // Emit with filter criteria
    this.emit('order:created', order);

    // Emit filtered events
    if (order.total > 1000) {
      this.emit('order:created:high-value', order);
    }

    if (order.urgent) {
      this.emit('order:created:urgent', order);
    }

    return order;
  }
}

// Different handlers for different order types
orderService.on('order:created:high-value', notifyManager);
orderService.on('order:created:urgent', prioritizeShipping);
```

---

## Common Use Cases

### 1. Order Management

```javascript
// Events throughout order lifecycle
orderService.emit('order:created', order);
orderService.emit('order:confirmed', order);
orderService.emit('order:payment:pending', order);
orderService.emit('order:payment:completed', order);
orderService.emit('order:preparing', order);
orderService.emit('order:ready-for-pickup', order);
orderService.emit('order:shipped', order);
orderService.emit('order:delivered', order);
```

### 2. User Authentication

```javascript
// Auth events
authService.emit('user:login:attempt', { email });
authService.emit('user:login:success', { userId });
authService.emit('user:login:failed', { email, reason });
authService.emit('user:logout', { userId });
authService.emit('user:session:expired', { userId });
```

### 3. Data Processing Pipeline

```javascript
// Pipeline events
dataService.emit('data:received', rawData);
dataService.emit('data:validated', validatedData);
dataService.emit('data:transformed', transformedData);
dataService.emit('data:enriched', enrichedData);
dataService.emit('data:stored', storedData);
```

### 4. Error Handling & Monitoring

```javascript
// Error events
service.emit('error:validation', { error, data });
service.emit('error:database', { error, query });
service.emit('error:external-api', { error, endpoint });
service.emit('error:critical', { error, context });

// Monitoring events
service.emit('metric:response-time', { duration });
service.emit('metric:request-count', { count });
service.emit('metric:error-rate', { rate });
```

---

## Testing Event-Driven Code

### Unit Testing

```javascript
import { describe, it, expect, vi } from 'vitest';
import { OrderService } from './order.service.js';

describe('OrderService', () => {
  it('should emit order:created event', () => {
    const orderService = new OrderService();
    const listener = vi.fn();
    
    // Register listener
    orderService.on('order:created', listener);
    
    // Create order
    const orderData = { product: 'Laptop', quantity: 1 };
    orderService.createOrder(orderData);
    
    // Assert listener was called
    expect(listener).toHaveBeenCalled();
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        product: 'Laptop',
        quantity: 1
      })
    );
  });

  it('should call email service when order is created', () => {
    const orderService = new OrderService();
    const emailService = { sendEmail: vi.fn() };
    
    // Register listener
    orderService.on('order:created', (data) => {
      emailService.sendEmail(data);
    });
    
    // Create order
    orderService.createOrder({ product: 'Phone' });
    
    // Assert email service was called
    expect(emailService.sendEmail).toHaveBeenCalled();
  });
});
```

### Integration Testing

```javascript
describe('Order Creation Flow', () => {
  it('should complete full order workflow', async () => {
    const orderService = new OrderService();
    const emailService = new EmailService();
    const inventoryService = new InventoryService();
    
    const emailSpy = vi.spyOn(emailService, 'sendEmail');
    const inventorySpy = vi.spyOn(inventoryService, 'updateInventory');
    
    // Setup listeners
    orderService.on('order:created', (data) => emailService.sendEmail(data));
    orderService.on('order:created', (data) => inventoryService.updateInventory(data));
    
    // Create order
    const order = orderService.createOrder({
      product: 'Laptop',
      quantity: 1
    });
    
    // Assert all services were called
    expect(emailSpy).toHaveBeenCalledWith(
      expect.objectContaining({ product: 'Laptop' })
    );
    expect(inventorySpy).toHaveBeenCalledWith(
      expect.objectContaining({ product: 'Laptop' })
    );
  });
});
```

---

## Distributed Systems

### Moving Beyond Single Process

In production applications, services often run as separate processes or microservices.

#### Single Process (What We've Done)

```
┌─────────────────────────────────────┐
│      Single Node.js Process         │
│                                     │
│  ┌──────────────┐                  │
│  │OrderService  │                  │
│  │(EventEmitter)│                  │
│  └──────┬───────┘                  │
│         │ emit                     │
│         ↓                          │
│  ┌──────────────┐  ┌─────────────┐│
│  │EmailService  │  │Inventory    ││
│  │(Subscriber)  │  │Service      ││
│  └──────────────┘  └─────────────┘│
└─────────────────────────────────────┘
```

#### Distributed System (Microservices)

```
┌─────────────────┐      ┌─────────────────┐
│ Order Service   │      │ Email Service   │
│ (Microservice)  │      │ (Microservice)  │
│                 │      │                 │
│ emit('order:    │      │ listen for      │
│ created')       │      │ 'order:created' │
└────────┬────────┘      └────────▲────────┘
         │                        │
         │   ┌────────────────┐   │
         └───►Message Broker  ├───┘
             │(Kafka/RabbitMQ)│
         ┌───┤                ├───┐
         │   └────────────────┘   │
         ↓                        │
┌────────────────┐                │
│ Inventory      │                │
│ Service        │◄───────────────┘
│ (Microservice) │
└────────────────┘
```

### Message Brokers

For distributed systems, we use message brokers instead of EventEmitter:

#### Apache Kafka

```javascript
// Producer (Order Service)
await producer.send({
  topic: 'order-events',
  messages: [{
    key: order.id,
    value: JSON.stringify({
      type: 'order:created',
      data: order
    })
  }]
});

// Consumer (Email Service)
await consumer.subscribe({ topic: 'order-events' });
await consumer.run({
  eachMessage: async ({ message }) => {
    const event = JSON.parse(message.value);
    if (event.type === 'order:created') {
      await sendEmail(event.data);
    }
  }
});
```

#### RabbitMQ

```javascript
// Publisher (Order Service)
channel.publish(
  'orders',  // exchange
  'order.created',  // routing key
  Buffer.from(JSON.stringify(order))
);

// Subscriber (Email Service)
channel.consume('email-queue', (msg) => {
  const order = JSON.parse(msg.content.toString());
  sendEmail(order);
  channel.ack(msg);
});
```

### Advantages of Message Brokers

1. **Persistence** - Messages stored even if consumer is down
2. **Reliability** - Guaranteed delivery with acknowledgments
3. **Scalability** - Multiple consumers for load balancing
4. **Decoupling** - Services completely independent
5. **Flexibility** - Different languages, technologies

---

## Performance Considerations

### 1. Event Listener Limits

Node.js warns if you add more than 10 listeners to an event:

```javascript
// Increase limit if needed
orderService.setMaxListeners(20);

// Or unlimited (use with caution)
orderService.setMaxListeners(0);
```

### 2. Memory Management

Remove listeners when no longer needed:

```javascript
const handler = (data) => console.log(data);

// Add listener
orderService.on('order:created', handler);

// Remove when done
orderService.removeListener('order:created', handler);
```

### 3. Async Processing

For heavy operations, make listeners async:

```javascript
orderService.on('order:created', async (data) => {
  // Don't block the event loop
  await heavyProcessing(data);
});
```

Or use task queues:

```javascript
orderService.on('order:created', (data) => {
  // Add to job queue instead of processing immediately
  queue.add('send-email', data);
});
```

---

## Debugging Event-Driven Code

### 1. Event Logging

Log all events for debugging:

```javascript
class LoggingEventEmitter extends EventEmitter {
  emit(event, ...args) {
    console.log(`[EVENT] ${event}`, args);
    return super.emit(event, ...args);
  }
}

class OrderService extends LoggingEventEmitter {
  // Now all emits are logged
}
```

### 2. Event Listener Tracking

Track registered listeners:

```javascript
// See all listeners for an event
console.log(orderService.listeners('order:created'));

// Count listeners
console.log(orderService.listenerCount('order:created'));

// Get all event names
console.log(orderService.eventNames());
```

### 3. Error Events

Always handle error events:

```javascript
orderService.on('error', (error) => {
  console.error('Order service error:', error);
  // Log to monitoring service
});

// Emit errors
if (validationFails) {
  this.emit('error', new Error('Validation failed'));
}
```

---

## Migration Strategy

### From Tightly Coupled to Event-Driven

#### Step 1: Identify Dependencies

```javascript
// Current: Tight coupling
class OrderService {
  createOrder(data) {
    this.emailService.send();      // Dependency 1
    this.inventoryService.update(); // Dependency 2
    this.analyticsService.track();  // Dependency 3
  }
}
```

#### Step 2: Extend EventEmitter

```javascript
class OrderService extends EventEmitter {
  createOrder(data) {
    // Keep existing logic for now
    this.emailService.send();
    this.inventoryService.update();
    this.analyticsService.track();
    
    // Add event emission
    this.emit('order:created', data);
  }
}
```

#### Step 3: Add Event Listeners

```javascript
// Register listeners alongside existing calls
orderService.on('order:created', (data) => {
  console.log('Event-driven email would go here');
});
```

#### Step 4: Remove Direct Dependencies

```javascript
class OrderService extends EventEmitter {
  createOrder(data) {
    // Only emit event - no direct dependencies
    this.emit('order:created', data);
  }
}
```

---

## Complete Example: Blog Platform

Let's build a complete blog platform using Event-Driven Architecture.

### Features

- Create post
- Send notification to followers
- Update search index
- Track analytics
- Generate sitemap

### Implementation

```javascript
// post.service.js
import EventEmitter from 'node:events';

export class PostService extends EventEmitter {
  createPost(postData) {
    // Save to database
    const post = {
      id: Date.now().toString(),
      ...postData,
      createdAt: new Date(),
      published: true
    };

    console.log('Post created:', post.id);

    // Emit events
    this.emit('post:created', post);
    this.emit('post:published', post);

    return post;
  }

  updatePost(postId, updates) {
    // Update in database
    const post = { id: postId, ...updates };

    this.emit('post:updated', post);

    return post;
  }

  deletePost(postId) {
    // Delete from database

    this.emit('post:deleted', { id: postId });

    return { success: true };
  }
}

// notification.service.js
export class NotificationService {
  notifyFollowers(post) {
    console.log(`Notifying followers about post: ${post.id}`);
    // Send push notifications, emails, etc.
  }

  notifyAuthor(post) {
    console.log(`Notifying author about post: ${post.id}`);
  }
}

// search.service.js
export class SearchService {
  indexPost(post) {
    console.log(`Indexing post for search: ${post.id}`);
    // Add to Elasticsearch, Algolia, etc.
  }

  removeFromIndex(postId) {
    console.log(`Removing post from index: ${postId}`);
  }
}

// analytics.service.js
export class AnalyticsService {
  trackPostCreation(post) {
    console.log(`Tracking post creation: ${post.id}`);
    // Send to Google Analytics, Mixpanel, etc.
  }

  trackPostUpdate(post) {
    console.log(`Tracking post update: ${post.id}`);
  }
}

// sitemap.service.js
export class SitemapService {
  regenerateSitemap() {
    console.log('Regenerating sitemap...');
    // Rebuild sitemap.xml
  }
}

// app.js
import express from 'express';
import { PostService } from './post.service.js';
import { NotificationService } from './notification.service.js';
import { SearchService } from './search.service.js';
import { AnalyticsService } from './analytics.service.js';
import { SitemapService } from './sitemap.service.js';

const app = express();
app.use(express.json());

// Initialize services
const postService = new PostService();
const notificationService = new NotificationService();
const searchService = new SearchService();
const analyticsService = new AnalyticsService();
const sitemapService = new SitemapService();

// Register event listeners
postService.on('post:created', (post) => {
  notificationService.notifyFollowers(post);
});

postService.on('post:created', (post) => {
  searchService.indexPost(post);
});

postService.on('post:created', (post) => {
  analyticsService.trackPostCreation(post);
});

postService.on('post:published', () => {
  sitemapService.regenerateSitemap();
});

postService.on('post:updated', (post) => {
  searchService.indexPost(post);
  analyticsService.trackPostUpdate(post);
});

postService.on('post:deleted', ({ id }) => {
  searchService.removeFromIndex(id);
  sitemapService.regenerateSitemap();
});

// Routes
app.post('/posts', (req, res) => {
  const post = postService.createPost(req.body);
  res.json({ success: true, post });
});

app.put('/posts/:id', (req, res) => {
  const post = postService.updatePost(req.params.id, req.body);
  res.json({ success: true, post });
});

app.delete('/posts/:id', (req, res) => {
  const result = postService.deletePost(req.params.id);
  res.json(result);
});

app.listen(3000, () => {
  console.log('Blog server running on port 3000');
});
```

### Testing the Blog Platform

```bash
# Create a post
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Event-Driven Architecture in Node.js",
    "content": "This is a great pattern...",
    "authorId": "123"
  }'

# Update a post
curl -X PUT http://localhost:3000/posts/1234567890 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content..."
  }'

# Delete a post
curl -X DELETE http://localhost:3000/posts/1234567890
```

---

## Key Takeaways

### Core Principles

1. **Events Over Direct Calls**
   - Emit events instead of calling methods directly
   - Let interested parties subscribe to events

2. **Loose Coupling**
   - Services don't know about each other
   - Easy to add/remove features

3. **Single Responsibility**
   - Each service does one thing well
   - Services are independent and testable

4. **Extensibility**
   - Add new subscribers without changing existing code
   - Scale by adding more listeners

### When to Use Event-Driven Architecture

✅ **Use when:**
- Multiple actions need to happen after an event
- Components should be decoupled
- System needs to be extensible
- Different parts of the system need to react to changes

❌ **Don't use when:**
- Simple, linear workflows
- Tight coupling is acceptable
- Debugging complexity is a concern
- Synchronous responses are critical

### Common Pitfalls

1. **Over-Engineering**
   - Don't use events for everything
   - Simple function calls are fine for simple cases

2. **Event Chains**
   - Avoid events triggering events triggering events
   - Keep event flows simple and traceable

3. **Error Handling**
   - Always handle errors in listeners
   - Emit error events for monitoring

4. **Memory Leaks**
   - Remove listeners when done
   - Be careful with listener limits

---

## Further Learning

### Advanced Topics

1. **Event Sourcing**
   - Store all changes as events
   - Rebuild state by replaying events
   - Enables time travel debugging

2. **CQRS (Command Query Responsibility Segregation)**
   - Separate read and write models
   - Use events to sync between models

3. **Saga Pattern**
   - Manage distributed transactions with events
   - Coordinate complex workflows

4. **Event Streaming**
   - Process continuous streams of events
   - Real-time data processing

### Recommended Tools

**For Single Process:**
- Node.js EventEmitter (built-in)
- EventEmitter2 (enhanced version)
- EventEmitter3 (faster alternative)

**For Distributed Systems:**
- Apache Kafka (event streaming)
- RabbitMQ (message broker)
- Redis Pub/Sub (simple messaging)
- AWS SNS/SQS (cloud messaging)
- Google Cloud Pub/Sub

### Resources

- **Node.js Documentation:** https://nodejs.org/api/events.html
- **Event-Driven Architecture Patterns**
- **Domain-Driven Design (DDD)**
- **Microservices Patterns**

---

## Conclusion

Event-Driven Architecture is a powerful pattern that:
- ✅ Decouples your code
- ✅ Makes systems extensible
- ✅ Improves maintainability
- ✅ Enables complex workflows
- ✅ Scales well

### The Power of Events

By using EventEmitter in Node.js, you can:
1. **Eliminate tight coupling** between modules
2. **Add new features** without modifying existing code
3. **Test components** in isolation
4. **Scale** your application gracefully
5. **Maintain** your codebase more easily

### Next Steps

1. **Practice** - Implement event-driven patterns in your projects
2. **Refactor** - Convert tightly coupled code to use events
3. **Experiment** - Try different event patterns
4. **Learn** - Explore distributed event systems (Kafka, RabbitMQ)
5. **Build** - Create real-world applications using these patterns

### Remember

> "Much of the Node.js core API is built around an idiomatic asynchronous event-driven architecture."

If it's good enough for Node.js core, it's good enough for your applications!

---

**Happy Coding! 🚀**