# Authentication System Setup Guide

## Overview

A complete authentication system has been created with login/signup functionality and user role management (Admin/User).

## Files Created

### Database

- **`database/users.sql`** - User table schema with role-based access control
  - Email (unique)
  - Password (bcrypt hashed)
  - Name
  - Role (admin/user)
  - Timestamps

### Backend API Endpoints

- **`api/auth-config.php`** - Auth utilities and session management
- **`api/auth/signup.php`** - POST endpoint for user registration
- **`api/auth/login.php`** - POST endpoint for user login
- **`api/auth/logout.php`** - GET/POST endpoint for logout
- **`api/auth/check-auth.php`** - GET endpoint to verify login status

### Frontend

- **`src/pages/Login.tsx`** - Login page with form validation and API integration
- **`src/pages/Signup.tsx`** - Signup page with password confirmation
- **`src/lib/api-config.ts`** - Updated with auth endpoints

## Step-by-Step Setup

### Step 1: Create the Database Table

1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Select the `bangla_travel_hub` database
3. Click "SQL" tab
4. Copy and paste the contents of `database/users.sql`
5. Click "Go" to execute

### Step 2: Admin User Setup

**Default Admin Credentials:**

- Email: `admin@banglatravel.com`
- Password: `admin123`

The admin user is automatically inserted when you run the SQL script. The password is hashed using bcrypt.

### Step 3: Test the System

#### Test Signup:

1. Navigate to `http://localhost:5173/signup`
2. Fill in the form:
   - Full Name: John Doe
   - Email: john@example.com
   - Password: password123
   - Confirm Password: password123
3. Click "Sign Up"
4. You should be redirected home with a success message

#### Test Login:

1. Navigate to `http://localhost:5173/login`
2. Use credentials:
   - Email: john@example.com
   - Password: password123
3. Click "Login"
4. You should be redirected home with a welcome message

#### Test Admin Login:

1. Navigate to `http://localhost:5173/login`
2. Use admin credentials:
   - Email: admin@banglatravel.com
   - Password: admin123
3. Click "Login"

### Step 4: Assign Your Own Admin Account

To make yourself an admin, you have two options:

**Option A: Using phpMyAdmin (Easiest)**

1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Select `bangla_travel_hub` database
3. Click on `users` table
4. Find your user account row
5. Click "Edit" (pencil icon)
6. Change the `role` field from `user` to `admin`
7. Click "Go"

**Option B: Using SQL Command**

1. Open phpMyAdmin and go to SQL tab
2. Run this command (replace the email):

```sql
UPDATE users SET role = 'admin' WHERE email = 'your.email@example.com';
```

## User Roles Explained

### Admin User

- Can manage all reviews
- Can delete any review
- Future: Can moderate other users, view analytics

### Regular User

- Can submit reviews
- Can delete their own reviews (future enhancement)
- Limited access to admin features

## API Endpoints Reference

### Signup

```
POST /api/auth/signup.php
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
Response: { success: true, user: {...} }
```

### Login

```
POST /api/auth/login.php
Body: {
  "email": "john@example.com",
  "password": "password123"
}
Response: { success: true, user: { id, email, name, role } }
```

### Check Auth Status

```
GET /api/auth/check-auth.php
Response: { success: true, isLoggedIn: true/false, user: {...} }
```

### Logout

```
POST /api/auth/logout.php
Response: { success: true, message: "Logged out successfully" }
```

## Security Features

✅ **Password Hashing** - Bcrypt with cost 10
✅ **Email Validation** - Format checking on signup
✅ **Session Management** - Server-side sessions
✅ **CORS Enabled** - Cross-origin requests allowed from frontend
✅ **Duplicate Email Check** - Prevents duplicate registrations
✅ **Password Strength** - Minimum 6 characters

## Troubleshooting

### "Could not connect to server"

- Make sure XAMPP Apache is running
- Check that your project is in `C:\xampp\htdocs\bangla-travel-hub-main\`

### "Email already registered"

- That email is already in the database
- Try signing up with a different email

### "Invalid email or password"

- Double-check your credentials
- Make sure you're using the correct email format

### Session not persisting

- Ensure cookies are enabled in your browser
- Check that PHP sessions are enabled in XAMPP

## Next Steps

To complete the authentication integration:

1. Add logout button to navbar
2. Show current user info in navbar when logged in
3. Protect admin routes (only admins can manage reviews)
4. Add user profile page
5. Add password reset functionality
