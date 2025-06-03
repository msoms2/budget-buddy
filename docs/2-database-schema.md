# Database Schema Description

## Core Tables

### Users
```sql
users
├── id (primary key)
├── name
├── email (unique)
├── email_verified_at
├── password
├── phone (nullable)
├── goals (text, nullable)
├── role (nullable)
├── avatar (nullable)
├── remember_token
└── timestamps
```

### Categories
```sql
expense_categories
├── id (primary key)
├── user_id (foreign key)
├── name
├── description (nullable)
├── icon (nullable)
├── icon_color (nullable)
├── bg_color (nullable)
├── parent_id (self-referencing foreign key)
├── is_system (boolean)
└── timestamps + soft deletes

earning_categories
├── id (primary key)
├── user_id (foreign key)
├── name
├── description (nullable)
├── icon (nullable)
├── icon_color (nullable)
├── bg_color (nullable)
└── timestamps + soft deletes
```

## Financial Records

### Transactions
```sql
expenses
├── id (primary key)
├── user_id (foreign key)
├── category_id (foreign key)
├── subcategory_id (foreign key, nullable)
├── amount
├── description
├── date
├── payment_method_id (foreign key)
└── timestamps

earnings
├── id (primary key)
├── user_id (foreign key)
├── category_id (foreign key)
├── subcategory_id (foreign key, nullable)
├── amount
├── description
├── date
└── timestamps
```

### Budgets
```sql
budgets
├── id (primary key)
├── user_id (foreign key)
├── name
├── amount
├── start_date
├── end_date
├── category_id (foreign key)
├── time_frame
└── timestamps
```

## Investment Management

### Investments
```sql
investments
├── id (primary key)
├── user_id (foreign key)
├── category_id (foreign key)
├── name
├── amount
├── start_date
├── description
└── timestamps

investment_transactions
├── id (primary key)
├── investment_id (foreign key)
├── type (buy/sell)
├── amount
├── price
├── date
└── timestamps

investment_performance_logs
├── id (primary key)
├── investment_id (foreign key)
├── value
├── return_rate
├── date
└── timestamps
```

## Goal Tracking

### Goals
```sql
goals
├── id (primary key)
├── user_id (foreign key)
├── name
├── target_amount
├── current_amount
├── deadline
├── description
└── timestamps

goal_transactions
├── id (primary key)
├── goal_id (foreign key)
├── amount
├── type (deposit/withdrawal)
├── date
└── timestamps
```

## Payment and Scheduling

### Payment Management
```sql
payment_methods
├── id (primary key)
├── user_id (foreign key)
├── name
├── type
├── details (json)
└── timestamps

payment_schedules
├── id (primary key)
├── user_id (foreign key)
├── name
├── amount
├── frequency
├── start_date
├── end_date (nullable)
├── category_id (foreign key)
├── type
└── timestamps
```

## Notifications and Settings

### Notification System
```sql
notifications
├── id (primary key)
├── user_id (foreign key)
├── type_id (foreign key)
├── message
├── read_at (nullable)
└── timestamps

notification_settings
├── id (primary key)
├── user_id (foreign key)
├── type_id (foreign key)
├── enabled (boolean)
└── timestamps
```

## Key Relationships

1. **User-Centric Relations**
   - User has many Categories (both expense and earning)
   - User has many Transactions (both expenses and earnings)
   - User has many Budgets
   - User has many Goals
   - User has many Investments

2. **Category Hierarchies**
   - Expense Categories can have parent-child relationships
   - Categories linked to Transactions
   - Categories linked to Budgets

3. **Financial Relations**
   - Goals have many Transactions
   - Investments have many Transactions and Performance Logs
   - Payment Schedules linked to Categories

4. **Notification System**
   - Users have many Notifications
   - Users have Notification Settings per type

## Database Design Principles

1. **Data Integrity**
   - Foreign key constraints
   - Soft deletes for recoverable data
   - Timestamps for audit trails

2. **Performance Optimization**
   - Indexed foreign keys
   - Efficient relationship structures
   - JSON columns for flexible data

3. **Security**
   - User-based data isolation
   - Role-based access control
   - Encrypted sensitive data