# Step-by-Step Database Setup Guide

## Prerequisites

- XAMPP installed and running
- Apache started ✓
- MySQL started ✓
- Browser open

---

## Step 1: Start XAMPP Services

### What to do:

1. Open **XAMPP Control Panel** (if not already open)
2. Make sure **Apache** has a green checkmark (running)
3. Make sure **MySQL** has a green checkmark (running)

### If not running:

- Click **Start** next to Apache
- Click **Start** next to MySQL
- Wait 3-5 seconds for them to start

✅ **Status:** Apache and MySQL are running

---

## Step 2: Open phpMyAdmin

### What to do:

1. Open your web browser (Chrome, Firefox, etc.)
2. Go to: **`http://localhost/phpmyadmin`**
3. Wait for the page to load

### What you should see:

- phpMyAdmin login screen OR
- phpMyAdmin dashboard with databases on the left side

✅ **Status:** phpMyAdmin is open

---

## Step 3: Create Database (If not auto-created)

### Option A: Database Already Exists

If you see `bangla_travel_hub` in the left sidebar under "Databases", skip to **Step 5**.

### Option B: Create New Database

#### What to do:

1. On the right side, find the **"Create Database"** section
2. In the text field, type: `bangla_travel_hub`
3. Leave the "Collation" as default
4. Click the **Create** button

### What you should see:

- Success message: "Database bangla_travel_hub has been created"
- Database appears in left sidebar

✅ **Status:** Database `bangla_travel_hub` created

---

## Step 4: Select Your Database

### What to do:

1. Look at the **left sidebar** (databases list)
2. Find and **click on** `bangla_travel_hub`
3. Wait for the database to open

### What you should see:

- Database opens
- Left sidebar shows: `bangla_travel_hub` with a small arrow
- Main area shows "No tables"
- **SQL** tab visible at the top

✅ **Status:** Database is selected

---

## Step 5: Open SQL Tab

### What to do:

1. At the top of the main area, find the **SQL tab**
2. Click on **SQL**

### What you should see:

- A large text box for entering SQL commands
- Button labeled **Go** at the bottom

✅ **Status:** SQL editor is open

---

## Step 6: Copy SQL Code

### What to do:

1. Go back to your text editor (VS Code)
2. Open file: `database/reviews.sql`
3. **Select All** code (Ctrl+A)
4. **Copy** code (Ctrl+C)

### The code includes:

- CREATE TABLE statement
- 4 sample reviews
- All necessary fields and indexes

✅ **Status:** SQL code is copied to clipboard

---

## Step 7: Paste SQL Code

### What to do:

1. Return to phpMyAdmin browser tab
2. Click in the **SQL text box** (the large white area)
3. **Paste** the code (Ctrl+V)
4. Look at the text box - it should now contain the SQL code

### What you should see:

- SQL code fills the text box
- Can see: `CREATE TABLE reviews...`
- Can see: `INSERT INTO reviews...`

✅ **Status:** SQL code is pasted in phpMyAdmin

---

## Step 8: Execute SQL

### What to do:

1. At the bottom right, find the **Go** button
2. Click the **Go** button
3. Wait 3-5 seconds

### What you should see:

- Green success message: "Affected rows: X"
- Table `reviews` appears in left sidebar
- 4 sample reviews are inserted

### If error appears:

- See **Troubleshooting** section below

✅ **Status:** Database is set up!

---

## Step 9: Verify Database

### What to do:

1. In the left sidebar, click on `reviews` table (under `bangla_travel_hub`)
2. Look for the **Browse** tab (should be selected)
3. Check if you see 4 rows with sample reviews

### What you should see:

- Sarah Ahmed (Dhaka) - Rating: 5 stars
- Michael Chen (Singapore) - Rating: 5 stars
- Priya Sharma (Mumbai) - Rating: 4 stars
- James Wilson (London) - Rating: 5 stars

✅ **Status:** Database setup complete!

---

## Step 10: Verify from Your App

### What to do:

1. Open your React app: `http://localhost:5173`
2. Scroll to the **Reviews** section
3. You should see 4 reviews displaying

### If reviews don't show:

- Make sure MySQL is running
- Check browser console for errors (F12)
- Check if API is responding correctly

✅ **Status:** Everything is working!

---

## Common Issues & Fixes

### ❌ "Cannot connect to phpmyadmin"

**Solution:**

- Start Apache in XAMPP
- Make sure Apache shows green checkmark
- Refresh browser (F5)

### ❌ "phpMyAdmin is blank/loading forever"

**Solution:**

- Start MySQL in XAMPP
- Restart both Apache and MySQL
- Clear browser cache (Ctrl+Shift+Delete)

### ❌ "Error: database already exists"

**Solution:**

- Click on `bangla_travel_hub` in left sidebar
- Go to SQL tab
- Just paste and run the code (it will update existing database)

### ❌ "Error: Syntax error in SQL"

**Solution:**

- Make sure you copied the ENTIRE file
- Delete any extra spaces before/after
- Paste the code fresh
- Click Go again

### ❌ "Table not created / 0 rows inserted"

**Solution:**

- Check if any error message appeared
- Try running the SQL code again
- Make sure MySQL is running
- Check that you selected the correct database first

### ❌ "Reviews don't show in app"

**Solution:**

1. Check database exists: Open phpMyAdmin
2. Check table exists: Click `bangla_travel_hub` → should see `reviews` table
3. Check data exists: Click `reviews` table → should see 4 rows
4. Restart React app: Stop `npm run dev` and run again
5. Hard refresh browser (Ctrl+Shift+R)

---

## Quick Checklist

Before moving to the next step:

- [ ] XAMPP is open
- [ ] Apache is running (green)
- [ ] MySQL is running (green)
- [ ] phpMyAdmin opens at `http://localhost/phpmyadmin`
- [ ] Database `bangla_travel_hub` exists
- [ ] SQL code is copied from `reviews.sql`
- [ ] SQL code is pasted in phpMyAdmin
- [ ] Go button is clicked
- [ ] Success message appears
- [ ] 4 sample reviews appear in table
- [ ] Reviews display in React app

---

## What Happens Next?

Once database is set up:

1. **Test "Review Us" button** - Click button in app
2. **Submit a review** - Fill form with test data
3. **Check phpMyAdmin** - New review appears with status='pending'
4. **Approve review** - Click Edit, change status to 'approved'
5. **Refresh app** - Your review now displays!

---

## File Locations

| What       | Location                      |
| ---------- | ----------------------------- |
| React App  | `http://localhost:5173`       |
| phpMyAdmin | `http://localhost/phpmyadmin` |
| SQL File   | `database/reviews.sql`        |
| Database   | `bangla_travel_hub`           |
| Table      | `reviews`                     |

---

## Support

If you get stuck:

1. Take a screenshot of the error
2. Check browser console (F12)
3. Verify XAMPP services are running
4. Try restarting XAMPP
5. Clear browser cache and refresh

---

✅ **You're ready! Follow the steps above to set up your database.**
