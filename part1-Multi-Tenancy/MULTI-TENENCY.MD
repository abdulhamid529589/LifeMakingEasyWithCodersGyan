# Multi-Tenancy in Software Engineering

## Introduction

Multi-tenancy is a fundamental concept in modern software engineering that every developer should understand. Whether you're building modern applications or preparing for interviews, multi-tenancy is a critical concept to master.

## What is Multi-Tenancy?

**Definition**: Multi-tenancy is a software architecture where a single application serves multiple customers (tenants), while keeping each customer's data isolated from others.

### Key Characteristics:
- **Single Application**: One codebase serves multiple customers
- **Data Isolation**: Customer A cannot see Customer B's data and vice versa
- **Shared Infrastructure**: Common resources are shared among all tenants

## Real-World Analogy: Apartment Building

Think of an apartment building with 17 floors and 4 apartments per floor (~68-70 apartments total):

- **The Building** = Application/Infrastructure
- **Each Apartment** = Individual Tenant/Customer
- **Private Space**: Each apartment has its own private area
- **Shared Resources**: Common corridor, elevator, water supply, electricity

Just like residents share common facilities but have private living spaces, multi-tenant applications share infrastructure while maintaining data privacy.

## Real-World Examples

### Shopify
- Multiple businesses subscribe to the platform
- Business 1 has its own customers
- Business 2 has its own customers
- Business 1 cannot see Business 2's data
- All businesses use the same Shopify application

### Other Examples:
- **Notion**: Organizations feature
- **GitHub**: Organizations/workspaces
- **Any SaaS application**: With "workspace" concept

## Traditional Approach (Before Multi-Tenancy)

### The Problem

Let's say you're building Shopify:

```
Business 1 → [Application Instance 1] → [Database 1]
Business 2 → [Application Instance 2] → [Database 2]
Business 3 → [Application Instance 3] → [Database 3]
```

**Issues with this approach:**
- Need separate server for each business
- For millions of businesses, need millions of servers
- Extremely complex to scale and maintain
- High infrastructure costs
- Difficult to manage

## Multi-Tenancy Solutions

### Approach 1: Database per Tenant

**Architecture:**
```
[Single Application]
    ├── Database 1 (Business 1)
    ├── Database 2 (Business 2)
    └── Database 3 (Business 3)
```

**How it works:**
- One application deployment
- Each business gets its own database
- Application code is shared (common)
- Only databases are separate (private space)

**Advantages:**
- ✅ Strong data isolation
- ✅ No chance of data leakage
- ✅ Each tenant's data is completely separate
- ✅ Easier to comply with data regulations

**Disadvantages:**
- ❌ Scaling issues (need new database for each tenant)
- ❌ Under-utilization of resources (small businesses don't need full database server)
- ❌ More complex to manage multiple databases
- ❌ Higher infrastructure costs

### Approach 2: Shared Database with Tenant ID

**Architecture:**
```
[Single Application] → [Single Database]
                         ├── Tenants Table
                         ├── Customers Table (with tenant_id)
                         └── Products Table (with tenant_id)
```

**Database Schema:**

```sql
-- Tenants Table
CREATE TABLE tenants (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    address VARCHAR(255)
);

-- Example data:
-- | id | name       | address |
-- | 1  | Business 1 | Addr 1  |
-- | 2  | Business 2 | Addr 2  |
-- | 3  | Business 3 | Addr 3  |

-- Customers Table
CREATE TABLE customers (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    address VARCHAR(255),
    tenant_id INT,  -- Links to tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Example data:
-- | id | name       | address | tenant_id |
-- | 1  | Customer 1 | Addr A  | 2         |
-- | 2  | Customer 2 | Addr B  | 1         |
-- | 3  | Customer 3 | Addr C  | 3         |
```

**How it works:**
1. All data stored in same database
2. Each record has a `tenant_id` field
3. Queries must always filter by `tenant_id`
4. Row-level data isolation

**Example Query:**
```sql
-- Fetch customers for Business 2 only
SELECT * FROM customers 
WHERE tenant_id = 2;
```

**Advantages:**
- ✅ Easy to scale (just add records)
- ✅ No need for new database per tenant
- ✅ Better resource utilization
- ✅ Single database to manage
- ✅ Cost-effective

**Disadvantages:**
- ❌ Risk of data leakage if queries aren't careful
- ❌ Developer must always remember to filter by tenant_id
- ❌ One forgotten WHERE clause can expose all data
- ❌ Less secure than separate databases
- ❌ Performance can degrade with massive data

## Comparison Table

| Feature | Database per Tenant | Shared Database |
|---------|-------------------|----------------|
| Data Isolation | Very Strong | Moderate (depends on code) |
| Scaling | More Complex | Easier |
| Cost | Higher | Lower |
| Risk of Data Leakage | Very Low | Higher (if not careful) |
| Resource Utilization | Can be inefficient | Efficient |
| Maintenance | More complex | Simpler |
| Best For | Regulated industries, enterprise | SaaS with many small tenants |

## Implementation Considerations

### Security Best Practices:
1. **Always filter by tenant_id** in queries
2. **Use middleware/filters** to automatically add tenant context
3. **Validate tenant access** in every API request
4. **Audit logs** for cross-tenant access attempts
5. **Regular security reviews** of queries

### When to Use Each Approach:

**Database per Tenant:**
- Enterprise customers with compliance requirements
- Large tenants with significant data
- When data isolation is critical (healthcare, finance)
- When tenants need custom schemas

**Shared Database:**
- SaaS with many small tenants
- When cost efficiency is important
- Standard schema for all tenants
- Rapid onboarding of new tenants

## Hybrid Approach

Some applications use a combination:
- Large enterprise customers → Separate databases
- Small businesses → Shared database with tenant_id

## Key Takeaways

1. **Multi-tenancy is essential** for modern SaaS applications
2. **Two main approaches**: Database per tenant vs. Shared database
3. **No perfect solution**: Each has trade-offs
4. **Choose based on**: Security needs, scale, cost, and tenant size
5. **Data isolation** must be maintained regardless of approach
6. Think of it like an **apartment building**: shared infrastructure, private spaces

## Code Example Pattern

```javascript
// Middleware to add tenant context
function tenantMiddleware(req, res, next) {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) {
        return res.status(403).json({ error: 'Tenant ID required' });
    }
    req.tenantId = tenantId;
    next();
}

// Always filter by tenant
app.get('/customers', tenantMiddleware, async (req, res) => {
    const customers = await db.query(
        'SELECT * FROM customers WHERE tenant_id = ?',
        [req.tenantId]
    );
    res.json(customers);
});
```

## Conclusion

Multi-tenancy is not complicated once you understand the concept. Whether you use separate databases or a shared database with tenant IDs, the goal remains the same: serve multiple customers from a single application while keeping their data completely isolated.

Remember: **Every approach has trade-offs. Choose based on your specific requirements.**

---

*For more premium content on software engineering concepts, visit the resources mentioned in the original video.*