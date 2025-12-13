# Dynamic Reviews System Setup Guide

This guide will help you set up the dynamic reviews system for the Bangla Travel Hub using XAMPP, PHP, and MySQL.

## Step 1: Database Setup

1. **Open phpMyAdmin**
   - Start XAMPP Control Panel
   - Click "Admin" next to MySQL
   - Or navigate to: `http://localhost/phpmyadmin`

2. **Create Database**
   - Click on "SQL" tab
   - Copy and paste the contents of `database/reviews.sql`
   - Click "Go" to execute

3. **Verify Database**
   - You should see `bangla_travel_hub` database in the left sidebar
   - Expand it and verify the `reviews` table exists with sample data

## Step 2: Configure PHP Backend

The PHP files are already created in the `api/` folder:
- `api/config.php` - Database connection configuration
- `api/reviews.php` - Main review API endpoints

**Default Configuration (XAMPP):**
- Host: localhost
- User: root
- Password: (empty - default XAMPP password)
- Database: bangla_travel_hub

If you changed these credentials, edit `api/config.php` accordingly.

## Step 3: Configure React Frontend

The React configuration is in `src/lib/api-config.ts`:

```typescript
export const API_BASE_URL = 'http://localhost/bangla-travel-hub-main/api';
```

**Important:** Make sure your project path matches. If your XAMPP htdocs folder structure is different, update the path:
- If project is at: `C:\xampp\htdocs\bangla-travel-hub-main`
- Then API_BASE_URL should be: `http://localhost/bangla-travel-hub-main/api`

## Step 4: Project Structure Setup

Your project should have this structure:
```
bangla-travel-hub-main/
├── api/
│   ├── config.php
│   └── reviews.php
├── database/
│   └── reviews.sql
├── src/
│   ├── components/
│   │   ├── Reviews.tsx (UPDATED)
│   │   ├── Hero.tsx (UPDATED)
│   │   ├── ReviewFormModal.tsx (NEW)
│   │   └── ...other components
│   ├── lib/
│   │   ├── api-config.ts (NEW)
│   │   └── utils.ts
│   └── ...other files
└── ...other files
```

## Step 5: Running the Application

### Option 1: Using XAMPP (Recommended for PHP Backend)

1. **Place project in htdocs:**
   - Copy `bangla-travel-hub-main` folder to `C:\xampp\htdocs\`

2. **Start XAMPP Services:**
   - Open XAMPP Control Panel
   - Click "Start" for Apache
   - Click "Start" for MySQL

3. **Access Frontend:**
   - Run: `npm run dev`
   - Frontend will be at: `http://localhost:5173` (or similar)

4. **Verify Backend:**
   - Visit: `http://localhost/bangla-travel-hub-main/api/reviews.php`
   - You should see JSON with existing reviews

### Option 2: Using PHP Built-in Server (Alternative)

From project root:
```bash
php -S localhost:8000 -t . -r router.php
```

## Step 6: Testing the Features

### Test 1: View Reviews
1. Open your React app
2. Scroll to the Reviews section
3. You should see 4 sample reviews from the database

### Test 2: Add New Review
1. Click "Review Us" button (in Hero or Reviews section)
2. Fill in the form:
   - Name: Your name
   - Email: your@email.com
   - Location: Your city
   - Tour Package: Select one
   - Rating: Click stars to rate
   - Comment: Write your review
3. Click "Submit Review"
4. You should see a success message

### Test 3: Admin Approval
1. Go to phpMyAdmin: `http://localhost/phpmyadmin`
2. Navigate to: `bangla_travel_hub` > `reviews` table
3. Your new review will be there with `status = 'pending'`
4. Change status to 'approved' and save
5. Refresh the React app - your review should now appear

## API Endpoints

### GET /api/reviews.php
Fetch all approved reviews

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Sarah Ahmed",
      "location": "Dhaka",
      "tour": "Cox's Bazar Beach Paradise",
      "rating": 5,
      "comment": "Amazing experience!",
      "date": "2024-01-15 10:30:00"
    }
  ]
}
```

### POST /api/reviews.php
Submit a new review

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "location": "New York",
  "tour": "Cox's Bazar Beach Paradise",
  "rating": 5,
  "comment": "Great experience visiting Bangladesh!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review submitted successfully and is pending approval"
}
```

## Troubleshooting

### Issue: "CORS Error" or "Cannot connect to backend"

**Solution:**
1. Make sure Apache and MySQL are running in XAMPP
2. Check that project folder is in htdocs
3. Verify API_BASE_URL in `src/lib/api-config.ts` matches your project path
4. Check browser console for exact error

### Issue: "Database connection failed"

**Solution:**
1. Verify MySQL is running in XAMPP
2. Check credentials in `api/config.php`
3. Ensure database is created by running SQL file

### Issue: Reviews not showing

**Solution:**
1. Check Network tab in browser DevTools
2. Verify API endpoint is being called correctly
3. Check database has approved reviews (status = 'approved')
4. Check browser console for errors

### Issue: Cannot submit review

**Solution:**
1. Fill all form fields
2. Comment must be at least 10 characters
3. Check browser console for specific error
4. Verify PHP backend is accessible

## Database Schema

```sql
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    tour VARCHAR(255) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## Features Implemented

✅ **Dynamic Review Display** - Reviews fetched from database
✅ **Review Form Modal** - User-friendly form to submit reviews
✅ **Star Rating** - Interactive 1-5 star rating system
✅ **Form Validation** - All fields required, email validation
✅ **Admin Approval** - Reviews pending until approved
✅ **Fallback Display** - Shows sample data if backend unavailable
✅ **CORS Support** - PHP backend handles CORS headers
✅ **Error Handling** - User-friendly error messages with toast notifications
✅ **Responsive Design** - Works on mobile and desktop

## Next Steps (Optional Enhancements)

1. **Edit/Delete Reviews** - Add ability for users to edit their own reviews
2. **User Authentication** - Implement login to track user reviews
3. **Email Notifications** - Notify users when their review is approved
4. **Moderation Dashboard** - Admin panel to approve/reject reviews
5. **Review Sorting** - Sort by date, rating, most helpful
6. **Photo Uploads** - Allow users to add photos with reviews

---

**Questions?** Check the browser console and network tab in DevTools for debugging information.
