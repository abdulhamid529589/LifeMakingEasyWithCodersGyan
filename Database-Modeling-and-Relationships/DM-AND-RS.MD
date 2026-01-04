# Database Modeling & Relationships

## Introduction

Just like relationships connect us in the real world - with family, neighbors, friends, and even inanimate objects - databases use relationships to connect data. Understanding these relationships is fundamental to database design and modeling.

**Key Insight**: If you don't understand relationships, you cannot design or model any database properly.

## What is Database Modeling?

Database modeling is the process of structuring how application data is stored in databases. There are different approaches:

1. **Simple Approach**: Dump all data into tables
2. **Optimized Approach**: Structure data properly across multiple tables for faster queries and better organization

This structuring process is called **Database Design** or **Database Modeling**.

## Types of Relationships

There are three fundamental types of relationships in database design:

### 1. One-to-One (1:1) Relationship

**Real-World Example**: You and your passport
- You have exactly **one** passport
- That passport belongs to exactly **one** person (you)

**Characteristics**:
- One entity is associated with exactly one instance of another entity
- Both directions are singular

**Database Example**:
```
Users Table              Contacts Table
├── id                  ├── id
├── name                ├── phone
└── ...                 ├── email
                        ├── linkedin
                        └── user_id (Foreign Key)
```

### 2. One-to-Many (1:N) Relationship

**Real-World Example**: Mother and children
- One mother can have **many** children
- Each child has **one** biological mother

**Characteristics**:
- One entity can have multiple instances of another entity
- But each instance of the second entity belongs to only one instance of the first

**Database Example**:
```
Courses Table           Modules Table
├── id                  ├── id
├── title               ├── title
├── price               ├── total_videos
└── ...                 ├── course_id (Foreign Key)
                        └── ...
```

### 3. Many-to-Many (M:N) Relationship

**Real-World Example**: Doctors and patients
- One doctor can have **many** patients
- One patient can visit **many** doctors

**Characteristics**:
- Multiple instances of one entity relate to multiple instances of another entity
- Both directions are plural

**Database Example**:
```
Users Table             Enrollments (Pivot)      Courses Table
├── id                  ├── id                   ├── id
├── name                ├── user_id (FK)         ├── title
└── ...                 ├── course_id (FK)       ├── price
                        └── enrolled_at          └── ...
```

## The Problem: Why Relationships Matter

### Scenario: Music Application
You need to store singers and their songs.

#### ❌ Bad Approach 1: Multiple Columns
```
Singers Table
├── id
├── name
├── song_1
├── song_2
├── song_3
└── ... (unlimited songs?)
```

**Problems**:
- Limited number of columns
- Hits database column limit
- Not scalable
- Wastes space if singer has few songs

#### ❌ Bad Approach 2: Array/JSON Column
```
Singers Table
├── id
├── name
└── songs [array: "song1", "song2", ...]
```

**Problems**:
- Single column becomes huge for singers with thousands of songs
- Hits database row size limit
- Difficult to query individual songs
- Performance issues

#### ✅ Good Approach: Use Relationships

Identify the relationship between singer and songs:
- One singer can have **many** songs
- Each song belongs to **one** singer
- This is a **One-to-Many** relationship!

## Foreign Keys

**Foreign Keys** are how we connect related tables.

**Definition**: A foreign key is a field in one table that references the primary key in another table.

```
Parent Table (Primary Key) ← Connected to → Child Table (Foreign Key)
```

## Practical Example: Learning Management System (LMS)

Let's design a database for an educational platform.

### 1. Users & Contacts (One-to-One)

```sql
-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(255)
);

-- Contacts Table (One-to-One with users)
CREATE TABLE contacts (
    id INT PRIMARY KEY,
    phone VARCHAR(20),
    email VARCHAR(255),
    linkedin VARCHAR(255),
    user_id INT UNIQUE,  -- Foreign Key (UNIQUE enforces 1:1)
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Why separate tables?**
- Users table stays clean and focused
- Contact info is organized separately
- Easier to query and maintain
- Better performance

**Example Data**:
```
Users:
| id | name   |
|----|--------|
| 1  | Sujoy  |
| 2  | Shivam |

Contacts:
| id | phone      | email           | linkedin    | user_id |
|----|------------|-----------------|-------------|---------|
| 1  | 1234567890 | sujoy@email.com | /in/sujoy   | 1       |
| 2  | 0987654321 | shiv@email.com  | /in/shivam  | 2       |
```

### 2. Courses & Modules (One-to-Many)

```sql
-- Courses Table
CREATE TABLE courses (
    id INT PRIMARY KEY,
    title VARCHAR(255),
    price DECIMAL(10,2)
);

-- Modules Table (Many modules belong to one course)
CREATE TABLE modules (
    id INT PRIMARY KEY,
    title VARCHAR(255),
    total_videos INT,
    course_id INT,  -- Foreign Key
    FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

**Relationship**: 
- One course can have **many** modules
- Each module belongs to **one** course
- This is **One-to-Many**

**Example Data**:
```
Courses:
| id | title              | price  |
|----|--------------------|--------|
| 1  | MERN Plus          | 15000  |
| 2  | Gen AI             | 14000  |

Modules:
| id | title            | total_videos | course_id |
|----|------------------|--------------|-----------|
| 1  | Introduction     | 10           | 1         |
| 2  | Project Setup    | 5            | 1         |
| 3  | LangChain        | 8            | 2         |
```

**Query Example**:
```sql
-- Get all modules for Gen AI course (course_id = 2)
SELECT * FROM modules WHERE course_id = 2;
```

### 3. Users & Courses - Enrollments (Many-to-Many)

**Relationship Analysis**:
- One student can enroll in **many** courses
- One course can have **many** students
- This is **Many-to-Many**!

**Solution**: Create a **Pivot Table** (also called Junction/Bridge Table)

```sql
-- Enrollments Pivot Table
CREATE TABLE enrollments (
    id INT PRIMARY KEY,
    user_id INT,  -- Foreign Key to users
    course_id INT,  -- Foreign Key to courses
    enrolled_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

**Example Data**:
```
Users:
| id | name   |
|----|--------|
| 1  | Sujoy  |
| 2  | Shivam |

Courses:
| id | title      |
|----|------------|
| 1  | MERN Plus  |
| 2  | Gen AI     |

Enrollments (Pivot Table):
| id | user_id | course_id |
|----|---------|-----------|
| 1  | 1       | 2         | -- Sujoy enrolled in Gen AI
| 2  | 2       | 1         | -- Shivam enrolled in MERN Plus
| 3  | 1       | 1         | -- Sujoy also enrolled in MERN Plus
```

**What This Represents**:
- Sujoy (user_id=1) is enrolled in Gen AI (course_id=2) and MERN Plus (course_id=1)
- Shivam (user_id=2) is enrolled in MERN Plus (course_id=1)
- MERN Plus has 2 students
- Gen AI has 1 student

## Naming Conventions

### Table Names
- Use plural form: `users`, `courses`, `modules`
- Or singular: `user`, `course`, `module`
- Be consistent throughout your database

### Foreign Key Naming
**Convention**: `{table_name_singular}_id`

Examples:
- `user_id` (references `users` table)
- `course_id` (references `courses` table)
- `module_id` (references `modules` table)

**Note**: This is a convention, not a requirement. You can name them differently, but consistency helps readability.

## Pivot Table (Junction Table)

**When to use**: For Many-to-Many relationships

**What is it**: An intermediate table that stores the relationship between two tables by holding their foreign keys.

**Other names**: 
- Junction Table
- Bridge Table
- Join Table
- Linking Table

**Structure**:
```sql
CREATE TABLE pivot_table_name (
    id INT PRIMARY KEY,  -- Optional
    table1_id INT,       -- Foreign Key to first table
    table2_id INT,       -- Foreign Key to second table
    -- Additional metadata (optional)
    created_at TIMESTAMP,
    FOREIGN KEY (table1_id) REFERENCES table1(id),
    FOREIGN KEY (table2_id) REFERENCES table2(id)
);
```

## Complete LMS Database Schema

```
┌─────────────┐         ┌──────────────┐
│   Users     │────1:1──│   Contacts   │
│  id (PK)    │         │  id (PK)     │
│  name       │         │  phone       │
└─────────────┘         │  email       │
      │                 │  user_id(FK) │
      │                 └──────────────┘
      │
      │ Many-to-Many
      │
      ├──────────────┐
      │              │
┌─────▼────────┐   ┌─▼─────────────┐   ┌─────────────┐
│ Enrollments  │   │               │   │   Courses   │
│  id (PK)     │   │  (Pivot)      │   │  id (PK)    │
│  user_id(FK) │───┴───────────────┘   │  title      │
│ course_id(FK)│                        │  price      │
└──────────────┘                        └──────┬──────┘
                                               │
                                               │ One-to-Many
                                               │
                                        ┌──────▼──────┐
                                        │   Modules   │
                                        │  id (PK)    │
                                        │  title      │
                                        │course_id(FK)│
                                        └─────────────┘
```

## Querying Related Data: JOINs

To fetch data from related tables, use **JOINs**.

### Example: Get all students enrolled in MERN Plus

```sql
SELECT users.name, courses.title
FROM users
JOIN enrollments ON users.id = enrollments.user_id
JOIN courses ON enrollments.course_id = courses.id
WHERE courses.title = 'MERN Plus';
```

**Result**:
```
| name   | title      |
|--------|------------|
| Sujoy  | MERN Plus  |
| Shivam | MERN Plus  |
```

### Example: Get all courses for Sujoy

```sql
SELECT courses.title, courses.price
FROM courses
JOIN enrollments ON courses.id = enrollments.course_id
JOIN users ON enrollments.user_id = users.id
WHERE users.name = 'Sujoy';
```

**Result**:
```
| title      | price  |
|------------|--------|
| Gen AI     | 14000  |
| MERN Plus  | 15000  |
```

## Relationship Identification Practice

Look around you and identify relationships:

### Examples:
1. **You & Your Microphones**: One-to-Many (you own multiple mics, each mic has one owner)
2. **You & Your Books**: One-to-Many
3. **Student & Classes**: Many-to-Many (one student takes many classes, one class has many students)
4. **Country & President**: One-to-One (one country has one current president)
5. **Author & Books**: One-to-Many (one author writes many books, each book has one primary author)
6. **Book & Authors** (Co-authors): Many-to-Many (one book can have multiple authors, one author can write multiple books)

## Assignment: Library Management System

Design a database for a library management system with the following entities:

### Entities:
1. **Users** (library members)
2. **Books**
3. **Authors**
4. **Borrows** (borrowing records)

### Your Task:
1. Identify the relationships between these entities
2. Determine the type of each relationship (1:1, 1:N, M:N)
3. Design the tables with appropriate columns
4. Define primary keys and foreign keys
5. Create pivot tables if needed

### Questions to Consider:
- Can one user borrow multiple books?
- Can one book be borrowed by multiple users (at different times)?
- Can one book have multiple authors?
- Can one author write multiple books?
- What information should be stored about each borrow?

## Summary

### Three Types of Relationships

| Type | Description | Example | Implementation |
|------|-------------|---------|----------------|
| **One-to-One (1:1)** | One entity → One entity | User ↔ Passport | Foreign Key in either table with UNIQUE constraint |
| **One-to-Many (1:N)** | One entity → Many entities | Course → Modules | Foreign Key in the "many" side table |
| **Many-to-Many (M:N)** | Many entities ↔ Many entities | Students ↔ Courses | Pivot/Junction table with two Foreign Keys |

### Key Concepts

1. **Primary Key**: Unique identifier for each record in a table
2. **Foreign Key**: Field that references the primary key of another table
3. **Pivot Table**: Intermediate table for Many-to-Many relationships
4. **JOIN**: SQL operation to combine data from related tables

### Best Practices

✅ **Do**:
- Identify relationships before designing tables
- Use consistent naming conventions
- Normalize data to avoid redundancy
- Use foreign keys to maintain referential integrity
- Create indexes on foreign keys for better performance

❌ **Don't**:
- Store related data in arrays/JSON when proper relationships can be used
- Create unlimited columns for related data
- Forget to define foreign key constraints
- Mix different relationship types in the same table

## Next Steps

1. **Learn JOINs**: Master INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL JOIN
2. **Database Normalization**: Learn 1NF, 2NF, 3NF
3. **Indexing**: Understand how to optimize database performance
4. **Partitioning**: Learn about scaling databases
5. **ORMs**: Study how frameworks handle relationships (Sequelize, TypeORM, Prisma)

---

**Remember**: Relationships in databases mirror real-world relationships. Once you understand how things connect in real life, applying them to database design becomes natural!

## Additional Resources

For more advanced topics:
- Database normalization
- Query optimization
- Index strategies
- Transaction management
- Database partitioning and sharding

---

*Happy Coding! Understanding relationships is the key to powerful database design.*