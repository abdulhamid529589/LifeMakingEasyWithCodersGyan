# E-Commerce Application - Complete Project Planning Guide
## Part 2: Admin Features & File Uploads (MERN Stack)

---

https://www.youtube.com/watch?v=T59sdV8q3p0

## Table of Contents
- [Project Overview](#project-overview)
- [Previous Features Recap](#previous-features-recap)
- [Feature 7: Admin Product Management](#feature-7-admin-product-management)
- [Feature 8: Admin Order Management](#feature-8-admin-order-management)
- [Feature 9: Admin User Management](#feature-9-admin-user-management)
- [Role-Based Access Control](#role-based-access-control)
- [File Upload Strategy](#file-upload-strategy)
- [Implementation Guidelines](#implementation-guidelines)
- [Complete System Architecture](#complete-system-architecture)

---

## Project Overview

This is **Part 2** of the E-commerce Application Planning series. This document covers:
- Admin dashboard features (Features 7, 8, 9)
- Role-based access control (RBAC)
- File upload strategies (S3 integration)
- Complete CRUD operations for products

### Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **File Storage:** AWS S3
- **Authentication:** JWT

---

## Previous Features Recap

Before diving into admin features, here's what was covered in Part 1:

### Feature 1: Browse Products
**User Story:** Users can browse and view products on the frontend

**Components:**
- Product listing page
- Product detail page
- Database: Products collection

### Feature 2: Add to Cart
**User Story:** Users can add products to their shopping cart

**Components:**
- Cart functionality
- Database: Cart collection
- Session management

### Feature 3: User Authentication
**User Story:** Users can register and login

**Components:**
- Registration/Login forms
- JWT authentication
- Database: Users collection

### Feature 4: Place Order
**User Story:** Users can checkout and place orders

**Components:**
- Checkout flow
- Order creation
- Database: Orders collection

### Feature 5: Track Orders
**User Story:** Users can track their order status

**Components:**
- Order tracking page
- Order history
- Status updates

### Feature 6: Cancel Orders
**User Story:** Users can cancel orders within a timeframe

**Components:**
- Cancel order functionality
- Cancellation window validation
- Order status updates

---

## Feature 7: Admin Product Management

### Overview
Admin users can Create, Read, Update, and Delete (CRUD) products from the admin dashboard.

---

### 7.1 Create Product

#### User Flow

```
Admin Dashboard
    ↓
Product Form (Name, Description, Price, Images, etc.)
    ↓
Submit Button
    ↓
POST /products
    ↓
Backend Processing
    ↓
Save to Database
    ↓
Success Response
```

#### Architecture Diagram

```
┌─────────────────────┐
│  Admin Dashboard    │
│                     │
│  ┌───────────────┐  │
│  │ Product Form  │  │
│  │               │  │
│  │ - Name        │  │
│  │ - Description │  │
│  │ - Price       │  │
│  │ - Category    │  │
│  │ - Stock       │  │
│  │ - Images      │  │
│  │               │  │
│  │ [Submit]      │  │
│  └───────┬───────┘  │
└──────────┼──────────┘
           │
           │ POST /products
           ↓
    ┌──────────────┐
    │   Backend    │
    │              │
    │ ┌──────────┐ │
    │ │MiddlewareMiddleware│ │
    │ │(Auth +   │ │
    │ │ Role     │ │
    │ │ Check)   │ │
    │ └────┬─────┘ │
    │      │       │
    │      ↓       │
    │ ┌──────────┐ │
    │ │ Product  │ │
    │ │Controller│ │
    │ └────┬─────┘ │
    └──────┼───────┘
           │
           ↓
    ┌──────────────┐
    │   Database   │
    │              │
    │  Products    │
    │  Collection  │
    └──────────────┘
```

#### API Endpoint

**Endpoint:** `POST /products`  
**Authentication:** Required (JWT)  
**Authorization:** Admin role only

**Request Body:**
```json
{
  "name": "Laptop",
  "slug": "laptop-dell-xps-15",
  "description": "High-performance laptop",
  "price": 1299.99,
  "category": "Electronics",
  "stock": 50,
  "images": [
    "https://s3.amazonaws.com/bucket/laptop-1.jpg",
    "https://s3.amazonaws.com/bucket/laptop-2.jpg"
  ],
  "variants": [
    {
      "name": "16GB RAM",
      "price": 1299.99,
      "stock": 30,
      "image": "https://s3.amazonaws.com/bucket/variant-1.jpg"
    },
    {
      "name": "32GB RAM",
      "price": 1599.99,
      "stock": 20,
      "image": "https://s3.amazonaws.com/bucket/variant-2.jpg"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "prod_123456",
    "name": "Laptop",
    "slug": "laptop-dell-xps-15",
    "price": 1299.99,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Database Model

**Collection:** `products`

```javascript
{
  _id: ObjectId,
  name: String,           // Product name
  slug: String,           // URL-friendly name
  description: String,    // Product description
  price: Number,          // Base price
  category: String,       // Product category
  stock: Number,          // Available quantity
  images: [String],       // Array of image URLs from S3
  variants: [
    {
      name: String,       // Variant name (e.g., "Red", "Large")
      price: Number,      // Variant price
      stock: Number,      // Variant stock
      image: String       // Variant image URL
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

#### Implementation Code

**Backend Route:**
```javascript
// routes/products.js
import express from 'express';
import { authenticateUser, authorizeAdmin } from '../middleware/auth.js';
import { createProduct } from '../controllers/productController.js';

const router = express.Router();

// Create product (Admin only)
router.post('/products', 
  authenticateUser,    // Verify JWT token
  authorizeAdmin,      // Check admin role
  createProduct
);

export default router;
```

**Middleware:**
```javascript
// middleware/auth.js
export const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorizeAdmin = (req, res, next) => {
  // Check if user has admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};
```

**Controller:**
```javascript
// controllers/productController.js
import Product from '../models/Product.js';

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      category,
      stock,
      images,
      variants
    } = req.body;

    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({
        message: 'Name, price, and category are required'
      });
    }

    // Create product
    const product = await Product.create({
      name,
      slug,
      description,
      price,
      category,
      stock,
      images,
      variants,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};
```

**Frontend Component:**
```javascript
// components/admin/CreateProduct.jsx
import { useState } from 'react';
import axios from 'axios';

const CreateProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post('/api/products', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      alert('Product created successfully!');
      // Reset form or redirect
    } catch (error) {
      if (error.response?.status === 403) {
        alert('Access denied. Admin privileges required.');
      } else {
        alert('Error creating product');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Product Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
      />
      
      <input
        type="number"
        placeholder="Price"
        value={formData.price}
        onChange={(e) => setFormData({...formData, price: e.target.value})}
      />
      
      {/* Image upload component - see File Upload section */}
      
      <button type="submit">Create Product</button>
    </form>
  );
};

export default CreateProduct;
```

---

### 7.2 Update Product

#### API Endpoint

**Endpoint:** `PUT /products/:id` or `PATCH /products/:id`  
**Authentication:** Required  
**Authorization:** Admin role only

**Request:**
```javascript
PUT /products/prod_123456

{
  "name": "Updated Laptop",
  "price": 1399.99,
  "stock": 45
}
```

**Implementation:**
```javascript
// Controller
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating product',
      error: error.message
    });
  }
};

// Route
router.put('/products/:id', 
  authenticateUser, 
  authorizeAdmin, 
  updateProduct
);
```

---

### 7.3 Delete Product

#### API Endpoint

**Endpoint:** `DELETE /products/:id`  
**Authentication:** Required  
**Authorization:** Admin role only

**Implementation:**
```javascript
// Controller
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Optional: Delete associated images from S3
    // await deleteImagesFromS3(product.images);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// Route
router.delete('/products/:id', 
  authenticateUser, 
  authorizeAdmin, 
  deleteProduct
);
```

---

### 7.4 List All Products (Admin View)

#### API Endpoint

**Endpoint:** `GET /products`  
**Note:** Same endpoint as public product listing, but returns all products for admin

**Implementation:**
```javascript
// Controller
export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;

    const query = category ? { category } : {};

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching products',
      error: error.message
    });
  }
};
```

**Frontend Component:**
```javascript
// components/admin/ProductList.jsx
const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const response = await axios.get('/api/products');
    setProducts(response.data.data);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts(); // Refresh list
    }
  };

  return (
    <div className="product-list">
      <h2>Products</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>${product.price}</td>
              <td>{product.stock}</td>
              <td>
                <button onClick={() => navigate(`/admin/products/edit/${product._id}`)}>
                  Edit
                </button>
                <button onClick={() => handleDelete(product._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

## Feature 8: Admin Order Management

### Overview
Admin users can view all orders and update order status (e.g., Processing, Shipped, Delivered).

---

### 8.1 View All Orders

#### Architecture

```
Admin Dashboard
    ↓
Orders Page
    ↓
GET /orders (Admin)
    ↓
Backend
    ↓
Database (Orders Collection)
    ↓
Return All Orders
```

#### API Endpoint

**Endpoint:** `GET /orders`  
**Authentication:** Required  
**Authorization:** Admin can see all orders, Users see only their orders

**Implementation:**
```javascript
// Controller
export const getOrders = async (req, res) => {
  try {
    let query = {};

    // If user is not admin, only show their orders
    if (req.user.role !== 'admin') {
      query.userId = req.user.id;
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .populate('items.productId', 'name price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Route
router.get('/orders', authenticateUser, getOrders);
```

**Alternative Approach (Separate Endpoints):**
```javascript
// Admin-specific endpoint
router.get('/admin/orders', 
  authenticateUser, 
  authorizeAdmin, 
  getAllOrders
);

// User-specific endpoint
router.get('/users/orders', 
  authenticateUser, 
  getUserOrders
);
```

---

### 8.2 Update Order Status

#### Workflow

```
Admin Dashboard
    ↓
Select Order
    ↓
Change Status (Dropdown)
    │
    ├─ Order Received
    ├─ Packing
    ├─ Out for Delivery
    └─ Delivered
    ↓
PUT /orders/:id/status
    ↓
Update Database
    ↓
Notify Customer (Optional)
```

#### API Endpoint

**Endpoint:** `PUT /orders/:id/status` or `PATCH /orders/:id/status`  
**Authentication:** Required  
**Authorization:** Admin only

**Request:**
```json
{
  "status": "Out for Delivery"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order status updated",
  "data": {
    "orderId": "order_123",
    "status": "Out for Delivery",
    "updatedAt": "2024-01-15T14:30:00Z"
  }
}
```

#### Implementation

**Backend:**
```javascript
// controllers/orderController.js
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = [
      'Order Received',
      'Packing',
      'Out for Delivery',
      'Delivered',
      'Cancelled'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status value'
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { 
        status, 
        updatedAt: new Date() 
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Optional: Send notification to customer
    // await sendStatusUpdateEmail(order);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// routes/orders.js
router.put('/orders/:id/status', 
  authenticateUser, 
  authorizeAdmin, 
  updateOrderStatus
);
```

**Frontend:**
```javascript
// components/admin/OrderManagement.jsx
const OrderManagement = () => {
  const [orders, setOrders] = useState([]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Refresh orders list
      fetchOrders();
      alert('Status updated successfully');
    } catch (error) {
      alert('Error updating status');
    }
  };

  return (
    <div className="order-management">
      <h2>Order Management</h2>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.userId.name}</td>
              <td>${order.total}</td>
              <td>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                >
                  <option>Order Received</option>
                  <option>Packing</option>
                  <option>Out for Delivery</option>
                  <option>Delivered</option>
                </select>
              </td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

## Feature 9: Admin User Management

### Overview
Admin users can view and manage all registered users/customers.

---

### 9.1 List All Users

#### API Endpoint

**Endpoint:** `GET /users`  
**Authentication:** Required  
**Authorization:** Admin only

**Implementation:**
```javascript
// Controller
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const users = await User.find()
      .select('-password') // Exclude password
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Route
router.get('/users', 
  authenticateUser, 
  authorizeAdmin, 
  getAllUsers
);
```

---

### 9.2 Update User Details

#### API Endpoint

**Endpoint:** `PUT /users/:id` or `PATCH /users/:id`  
**Authentication:** Required  
**Authorization:** Admin only

**Implementation:**
```javascript
// Controller
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Don't allow password updates through this endpoint
    const updates = { name, email, role };

    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Route
router.put('/users/:id', 
  authenticateUser, 
  authorizeAdmin, 
  updateUser
);
```

---

### 9.3 Frontend User Management

```javascript
// components/admin/UserManagement.jsx
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    const response = await axios.get(`/api/users?page=${currentPage}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUsers(response.data.data);
  };

  return (
    <div className="user-management">
      <h2>User Management</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Registered</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td>
                <button onClick={() => editUser(user._id)}>Edit</button>
                <button onClick={() => deleteUser(user._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination */}
      <div className="pagination">
        <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button onClick={() => setCurrentPage(prev => prev + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};
```

---

## Role-Based Access Control (RBAC)

### User Model with Roles

**Database Model:**
```javascript
// models/User.js
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'  // Default role for new users
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);
```

### Authentication Middleware

```javascript
// middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify JWT token
export const authenticateUser = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ 
        message: 'User not found' 
      });
    }

    // Attach user to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    return res.status(401).json({ 
      message: 'Invalid or expired token' 
    });
  }
};

// Check admin role
export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. Admin privileges required.',
      requiredRole: 'admin',
      currentRole: req.user.role
    });
  }
  next();
};

// Check specific roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required roles: ${roles.join(', ')}`,
        currentRole: req.user.role
      });
    }
    next();
  };
};
```

### Protected Routes Example

```javascript
// routes/products.js
import express from 'express';
import { 
  authenticateUser, 
  authorizeAdmin 
} from '../middleware/auth.js';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';

const router = express.Router();

// Public routes
router.get('/products', getProducts);           // Anyone can view
router.get('/products/:id', getProduct);        // Anyone can view

// Protected routes (Admin only)
router.post('/products', 
  authenticateUser,    // First: Verify user is logged in
  authorizeAdmin,      // Second: Check if user is admin
  createProduct
);

router.put('/products/:id', 
  authenticateUser, 
  authorizeAdmin, 
  updateProduct
);

router.delete('/products/:id', 
  authenticateUser, 
  authorizeAdmin, 
  deleteProduct
);

export default router;
```

### Creating Admin Users

```javascript
// scripts/createAdmin.js
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const createAdminUser = async () => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'  // Explicitly set admin role
    });

    console.log('Admin user created:', admin);
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};
```

---

## File Upload Strategy

### The Problem: Local Storage

**Why NOT to store files locally:**

```
┌─────────────┐
│  Frontend   │
│             │
└──────┬──────┘
       │ Upload file
       ↓
┌─────────────┐      ┌──────────────┐
│  Backend    │      │ /uploads/    │
│             ├─────→│  - image1.jpg│
│             │      │  - image2.jpg│
└─────────────┘      └──────────────┘
```

**Problems:**
1. ❌ **Doesn't Scale** - Files stored on one server
2. ❌ **Bandwidth Consumption** - Server bandwidth used for file transfers
3. ❌ **Storage Limits** - Server disk space limited
4. ❌ **No CDN** - Slow file delivery to users
5. ❌ **Load Balancing Issues** - Files not available across multiple servers
6. ❌ **Backup Complexity** - Need to backup server files separately

---

### The Solution: AWS S3

**Benefits of S3:**
✅ **Scalable** - Unlimited storage  
✅ **CDN Integration** - Fast global delivery  
✅ **Durability** - 99.999999999% durability  
✅ **Cost-Effective** - Pay only for what you use  
✅ **Reduced Server Load** - Files served from S3  

---

### File Upload Flow Options

#### Option 1: Upload Through Backend (Not Recommended)

```
Frontend → Backend → Temp Folder → S3
```

**Problems:**
- Consumes backend bandwidth
- Slower upload process
- Temporary storage needed

#### Option 2: Direct Upload with Presigned URL (Recommended)

```
Frontend → Get Presigned URL → Direct Upload to S3
```

**Advantages:**
- No backend bandwidth used
- Faster uploads
- Reduced server load

---

### Presigned URL Flow (Recommended)

#### Complete Workflow

```
Step 1: User Selects Image
    ↓
┌─────────────────┐
│   Frontend      │
│                 │
│  [Select Image] │
└────────┬────────┘
         │
         │ GET /presigned-url
         ↓
┌─────────────────┐
│   Backend       │
│                 │
│  Request        │
│  Presigned URL  │
└────────┬────────┘
         │
         │ Generate presigned URL
         ↓
┌─────────────────┐
│   AWS S3        │
│                 │
│  Return         │
│  Presigned URL  │
└────────┬────────┘
         │
         │ URL with auth
         ↓
┌─────────────────┐
│   Frontend      │
│                 │
│  Upload directly│
│  to S3 using URL│
└────────┬────────┘
         │
         │ PUT request with file
         ↓
┌─────────────────┐
│   AWS S3        │
│                 │
│  File Stored    │
│  Return URL     │
└────────┬────────┘
         │
         │ Image URL
         ↓
┌─────────────────┐
│   Frontend      │
│                 │
│  Submit form    │
│  with image URL │
└────────┬────────┘
         │
         │ POST /products (with URL)
         ↓
┌─────────────────┐
│   Backend       │
│                 │
│  Save product   │
│  with image URL │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Database      │
│                 │
│  Store product  │
│  + image URL    │
└─────────────────┘
```

---

### Implementation: Presigned URL

#### Step 1: Backend - Generate Presigned URL

```javascript
// controllers/uploadController.js
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

export const getPresignedUrl = async (req, res) => {
  try {
    const { fileName, fileType } = req.body;

    // Generate unique file name
    const uniqueFileName = `${uuidv4()}-${fileName}`;

    // S3 parameters
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `products/${uniqueFileName}`,
      Expires: 60 * 5, // URL expires in 5 minutes
      ContentType: fileType,
      ACL: 'public-read' // Make file publicly readable
    };

    // Generate presigned URL
    const presignedUrl = await s3.getSignedUrlPromise('putObject', params);

    // Return presigned URL and final image URL
    res.json({
      success: true,
      uploadUrl: presignedUrl,
      imageUrl: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/products/${uniqueFileName}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating presigned URL',
      error: error.message
    });
  }
};
```

**Route:**
```javascript
// routes/upload.js
import express from 'express';
import { authenticateUser, authorizeAdmin } from '../middleware/auth.js';
import { getPresignedUrl } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/presigned-url', 
  authenticateUser, 
  authorizeAdmin, 
  getPresignedUrl
);

export default router;
```

---

#### Step 2: Frontend - Upload File

```javascript
// components/admin/ImageUpload.jsx
import { useState } from 'react';
import axios from 'axios';

const ImageUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const uploadImage = async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    try {
      setUploading(true);

      // Step 1: Get presigned URL from backend
      const token = localStorage.getItem('token');
      
      const presignedResponse = await axios.post(
        '/api/presigned-url',
        {
          fileName: selectedFile.name,
          fileType: selectedFile.type
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { uploadUrl, imageUrl } = presignedResponse.data;

      // Step 2: Upload file directly to S3
      await axios.put(uploadUrl, selectedFile, {
        headers: {
          'Content-Type': selectedFile.type
        }
      });

      // Step 3: Notify parent component with image URL
      onUploadSuccess(imageUrl);

      alert('Image uploaded successfully!');
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
      />
      
      {selectedFile && (
        <div>
          <p>Selected: {selectedFile.name}</p>
          <button onClick={uploadImage} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload to S3'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
```

---

#### Step 3: Use in Product Form

```javascript
// components/admin/CreateProduct.jsx
import { useState } from 'react';
import ImageUpload from './ImageUpload';

const CreateProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    images: []
  });

  const handleImageUpload = (imageUrl) => {
    // Add uploaded image URL to form data
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, imageUrl]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Submit form with image URLs
    await axios.post('/api/products', formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Product Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      
      <input
        type="number"
        placeholder="Price"
        value={formData.price}
        onChange={(e) => setFormData({...formData, price: e.target.value})}
      />
      
      {/* Image Upload Component */}
      <ImageUpload onUploadSuccess={handleImageUpload} />
      
      {/* Display uploaded images */}
      <div className="uploaded-images">
        {formData.images.map((url, index) => (
          <div key={index}>
            <img src={url} alt={`Product ${index + 1}`} width="100" />
            <button onClick={() => removeImage(index)}>Remove</button>
          </div>
        ))}
      </div>
      
      <button type="submit">Create Product</button>
    </form>
  );
};
```

---

### Environment Variables

```env
# .env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

---

### Alternative Upload Strategies

#### Strategy 1: Upload First, Then Create Product
```
1. User selects image
2. Image uploaded to S3 immediately
3. User fills rest of form
4. Submit creates product with image URL
```

#### Strategy 2: Create Product First, Then Upload
```
1. Create product (without images)
2. Get product ID
3. Upload images with product ID in filename
4. Update product with image URLs
```

#### Strategy 3: Batch Upload
```
1. User selects multiple images
2. Get multiple presigned URLs
3. Upload all images in parallel
4. Submit product with all URLs
```

---

## Implementation Guidelines

### Development Workflow

1. **Start with Backend**
   - Set up Express server
   - Create database models
   - Implement authentication
   - Create API endpoints
   - Add role-based middleware

2. **Build Admin Dashboard**
   - Create admin layout
   - Implement product management
   - Add order management
   - Build user management

3. **Integrate File Uploads**
   - Set up AWS S3
   - Implement presigned URL generation
   - Build upload components
   - Test upload flow

4. **Testing**
   - Test all CRUD operations
   - Verify role-based access
   - Test file uploads
   - Check error handling

---

### Security Best Practices

#### 1. Authentication
```javascript
// Always verify token
authenticateUser

// Check token expiration
if (decoded.exp < Date.now() / 1000) {
  throw new Error('Token expired');
}
```

#### 2. Authorization
```javascript
// Always check role before sensitive operations
authorizeAdmin

// Log access attempts
logger.info(`Admin access attempt by ${req.user.email}`);
```

#### 3. Input Validation
```javascript
// Validate all inputs
const { error } = productSchema.validate(req.body);
if (error) {
  return res.status(400).json({ message: error.details[0].message });
}
```

#### 4. File Upload Security
```javascript
// Validate file type
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type');
}

// Limit file size
const maxSize = 5 * 1024 * 1024; // 5MB
if (file.size > maxSize) {
  throw new Error('File too large');
}
```

#### 5. Rate Limiting
```javascript
import rateLimit from 'express-rate-limit';

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per window
  message: 'Too many uploads, please try again later'
});

router.post('/presigned-url', uploadLimiter, getPresignedUrl);
```

---

## Complete System Architecture

### High-Level Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND                               │
│                                                               │
│  ┌─────────────────┐         ┌─────────────────┐            │
│  │  User Interface │         │ Admin Dashboard │            │
│  │                 │         │                 │            │
│  │ - Browse        │         │ - Products CRUD │            │
│  │ - Cart          │         │ - Orders Mgmt   │            │
│  │ - Checkout      │         │ - Users Mgmt    │            │
│  │ - Track Orders  │         │ - File Upload   │            │
│  └────────┬────────┘         └────────┬────────┘            │
└───────────┼──────────────────────────┼───────────────────────┘
            │                          │
            │         API Calls        │
            └─────────────┬────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│                        BACKEND                                │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Express.js Server                        │   │
│  │                                                       │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│  │  │  Auth      │  │  Products  │  │  Orders    │    │   │
│  │  │  Routes    │  │  Routes    │  │  Routes    │    │   │
│  │  └────────────┘  └────────────┘  └────────────┘    │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────┐     │   │
│  │  │         Middleware Layer                   │     │   │
│  │  │  - authenticateUser                        │     │   │
│  │  │  - authorizeAdmin                          │     │   │
│  │  │  - errorHandler                            │     │   │
│  │  └────────────────────────────────────────────┘     │   │
│  └──────────────────┬───────────────────────────────────┘   │
└─────────────────────┼───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ↓                           ↓
┌──────────────┐            ┌──────────────┐
│   MongoDB    │            │   AWS S3     │
│              │            │              │
│ - Users      │            │ - Product    │
│ - Products   │            │   Images     │
│ - Orders     │            │ - Variant    │
│ - Cart       │            │   Images     │
└──────────────┘            └──────────────┘
```

---

### Database Schema Summary

```javascript
// Users Collection
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['customer', 'admin']),
  createdAt: Date,
  updatedAt: Date
}

// Products Collection
{
  _id: ObjectId,
  name: String,
  slug: String,
  description: String,
  price: Number,
  category: String,
  stock: Number,
  images: [String], // S3 URLs
  variants: [
    {
      name: String,
      price: Number,
      stock: Number,
      image: String // S3 URL
    }
  ],
  createdAt: Date,
  updatedAt: Date
}

// Orders Collection
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  items: [
    {
      productId: ObjectId (ref: 'Product'),
      variantId: String,
      quantity: Number,
      price: Number
    }
  ],
  total: Number,
  status: String (enum: ['Order Received', 'Packing', 'Out for Delivery', 'Delivered', 'Cancelled']),
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  createdAt: Date,
  updatedAt: Date
}

// Cart Collection
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  items: [
    {
      productId: ObjectId (ref: 'Product'),
      variantId: String,
      quantity: Number
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints Summary

### Public Endpoints
```
GET    /api/products              - List all products
GET    /api/products/:id          - Get single product
POST   /api/auth/register         - Register user
POST   /api/auth/login            - Login user
```

### Authenticated Endpoints (Customer)
```
GET    /api/cart                  - Get user's cart
POST   /api/cart                  - Add to cart
PUT    /api/cart/:id              - Update cart item
DELETE /api/cart/:id              - Remove from cart
POST   /api/orders                - Create order
GET    /api/orders                - Get user's orders
GET    /api/orders/:id            - Get order details
PUT    /api/orders/:id/cancel     - Cancel order
```

### Admin Endpoints
```
POST   /api/products              - Create product
PUT    /api/products/:id          - Update product
DELETE /api/products/:id          - Delete product

GET    /api/orders                - Get all orders
PUT    /api/orders/:id/status     - Update order status

GET    /api/users                 - Get all users
PUT    /api/users/:id             - Update user

POST   /api/presigned-url         - Get S3 presigned URL
```

---

## Testing Checklist

### Product Management
- [ ] Admin can create product
- [ ] Admin can update product
- [ ] Admin can delete product
- [ ] Admin can view all products
- [ ] Non-admin cannot create/update/delete products
- [ ] Images upload to S3 successfully
- [ ] Product data saves correctly

### Order Management
- [ ] Admin can view all orders
- [ ] Admin can update order status
- [ ] Customers can view only their orders
- [ ] Order status updates correctly
- [ ] Non-admin cannot update order status

### User Management
- [ ] Admin can view all users
- [ ] Admin can update user details
- [ ] Non-admin cannot access user list
- [ ] User data displays correctly

### File Uploads
- [ ] Presigned URL generates correctly
- [ ] File uploads to S3 successfully
- [ ] Image URL saves in database
- [ ] Uploaded images display correctly
- [ ] File type validation works
- [ ] File size validation works

### Authentication & Authorization
- [ ] JWT tokens generate correctly
- [ ] Token validation works
- [ ] Admin middleware blocks non-admins
- [ ] Expired tokens are rejected
- [ ] Invalid tokens are rejected

---

## Next Steps

### For Developers

1. **Implement Backend**
   - Set up Express server
   - Create database models
   - Build API endpoints
   - Add authentication/authorization

2. **Build Frontend**
   - Create admin dashboard UI
   - Implement product management
   - Build order management interface
   - Add user management

3. **Integrate S3**
   - Set up AWS account
   - Create S3 bucket
   - Implement presigned URL logic
   - Build upload components

4. **Testing & Deployment**
   - Write unit tests
   - Perform integration testing
   - Set up CI/CD
   - Deploy to production

### Learning Resources

- **Authentication:** JWT, bcrypt, role-based access control
- **File Uploads:** AWS S3, presigned URLs, multipart uploads
- **Database:** MongoDB, Mongoose, indexing
- **Security:** Input validation, rate limiting, CORS

---

## Common Issues & Solutions

### Issue 1: 403 Forbidden on Admin Routes
**Solution:** Verify user has admin role and token is valid
```javascript
// Check token and role
console.log('User:', req.user);
console.log('Role:', req.user.role);
```

### Issue 2: Presigned URL Expired
**Solution:** Generate new URL (they expire in 5 minutes)
```javascript
// Set appropriate expiration
Expires: 60 * 5 // 5 minutes
```

### Issue 3: CORS Errors
**Solution:** Configure CORS properly
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Issue 4: File Upload Fails
**Solution:** Check AWS credentials and bucket permissions
```javascript
// Verify AWS configuration
console.log('AWS Region:', process.env.AWS_REGION);
console.log('Bucket:', process.env.S3_BUCKET_NAME);
```

---

## Conclusion

This project planning guide covers:
✅ Complete admin dashboard features  
✅ Role-based access control implementation  
✅ Secure file upload strategy using S3  
✅ Complete CRUD operations  
✅ Best practices for security and scalability  

### Key Takeaways

1. **Admin Features** - Comprehensive product, order, and user management
2. **RBAC** - Proper role-based access control is essential
3. **File Uploads** - Always use cloud storage (S3) for scalability
4. **Presigned URLs** - Direct upload to S3 saves bandwidth
5. **Security** - Validate inputs, check permissions, handle errors

### Remember

- This is a planning document - actual implementation may vary
- Always validate and sanitize user inputs
- Implement proper error handling
- Write tests for critical functionality
- Keep security as top priority

**Happy Coding! 🚀**

---

**Note:** This is Part 2 of the E-commerce Application Planning series. Make sure to review Part 1 for the customer-facing features before implementing admin features.