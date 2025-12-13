# Fix: 404 Error on API Endpoint

## Error Message
```
/bangla-travel-hub-main/api/reviews.php:1  Failed to load resource: the server responded with a status of 404 (Not Found)
Error fetching reviews: SyntaxError: Unexpected token '<', "<!DOCTYPE "...
```

## Cause
The React app cannot find the PHP API files because your project folder is NOT in XAMPP's `htdocs` directory.

---

## Fix: Move Project to XAMPP

### Step 1: Locate Your Project
- Current location: `E:\Bongoboltu Travel Website\bangla-travel-hub-main\`
- Target location: `C:\xampp\htdocs\bangla-travel-hub-main\`

### Step 2: Copy Project Folder
1. Open **File Explorer**
2. Navigate to: `E:\Bongoboltu Travel Website\`
3. Right-click on `bangla-travel-hub-main` folder
4. Click **Copy**

### Step 3: Paste into XAMPP
1. Navigate to: `C:\xampp\htdocs\`
2. Right-click in empty space
3. Click **Paste**
4. Wait for copy to complete (may take a minute)

### Step 4: Update VS Code Workspace
1. Open VS Code
2. Click **File** → **Open Folder**
3. Navigate to: `C:\xampp\htdocs\bangla-travel-hub-main\`
4. Click **Select Folder**
5. Click **Yes** if asked to trust the workspace

### Step 5: Run Dev Server Again
```bash
npm run dev
```

### Step 6: Access App
- Go to: `http://localhost:5173`
- Should see reviews loading now! ✅

---

## Verify Setup

### Check 1: Project Location
- Should be: `C:\xampp\htdocs\bangla-travel-hub-main\`
- Verify by opening File Explorer and navigating there

### Check 2: XAMPP Running
- Apache: Green checkmark in XAMPP Control Panel
- MySQL: Green checkmark in XAMPP Control Panel

### Check 3: API Accessible
- Open browser tab: `http://localhost/bangla-travel-hub-main/api/reviews.php`
- Should see JSON response like:
  ```json
  {"success":true,"data":[...]}
  ```

### Check 4: React App Loading
- Go to: `http://localhost:5173`
- Should see reviews displaying
- No 404 errors in console

---

## If Still Getting 404

### Possible Issues:

**Issue 1: PHP files not copied**
- Solution: Make sure `api/config.php` and `api/reviews.php` exist in the new location
- Check: `C:\xampp\htdocs\bangla-travel-hub-main\api\`

**Issue 2: Apache not serving PHP**
- Solution: Restart Apache in XAMPP
- Check: Apache shows green checkmark

**Issue 3: Wrong folder structure**
- Solution: Verify folder path is exactly: `C:\xampp\htdocs\bangla-travel-hub-main\`
- Not: `C:\xampp\htdocs\bangla-travel-hub-main-main\` (duplicate)
- Not: `C:\xampp\htdocs\bangla-travel-hub\` (missing -main)

**Issue 4: Browser cache**
- Solution: Hard refresh (Ctrl+Shift+R)
- Clear cache if needed (Ctrl+Shift+Delete)

---

## Verify PHP Files Exist

### File 1: config.php
- Location: `C:\xampp\htdocs\bangla-travel-hub-main\api\config.php`
- Should contain: Database connection code

### File 2: reviews.php
- Location: `C:\xampp\htdocs\bangla-travel-hub-main\api\reviews.php`
- Should contain: GET and POST endpoints

### To verify:
1. Open File Explorer
2. Navigate to: `C:\xampp\htdocs\bangla-travel-hub-main\api\`
3. Should see 2 files: `config.php` and `reviews.php`

---

## Test API Directly

1. Make sure Apache and MySQL are running
2. Open new browser tab
3. Go to: `http://localhost/bangla-travel-hub-main/api/reviews.php`
4. You should see JSON like:
   ```json
   {
     "success": true,
     "data": [
       {
         "id": 1,
         "name": "Sarah Ahmed",
         "location": "Dhaka",
         ...
       }
     ]
   }
   ```

If you see HTML error instead (like `<!DOCTYPE html>`), the PHP file wasn't found.

---

## Quick Checklist

Before testing again:

- [ ] Project folder copied to `C:\xampp\htdocs\bangla-travel-hub-main\`
- [ ] VS Code workspace updated to new location
- [ ] Apache running (green in XAMPP)
- [ ] MySQL running (green in XAMPP)
- [ ] `npm run dev` started
- [ ] Files exist: `api/config.php` and `api/reviews.php`
- [ ] Can access: `http://localhost/bangla-travel-hub-main/api/reviews.php`
- [ ] Shows JSON (not HTML error)
- [ ] React app: `http://localhost:5173` shows reviews

---

## Still Not Working?

1. **Check console errors** (F12 in browser)
2. **Check XAMPP error log**: Click "Logs" button in XAMPP Control Panel
3. **Restart everything**:
   - Stop Apache
   - Stop MySQL
   - Close browser
   - Restart XAMPP
   - Start Apache
   - Start MySQL
   - Refresh browser

---

## Important Notes

### API Path
- React app runs on: `http://localhost:5173`
- PHP API runs on: `http://localhost/bangla-travel-hub-main/api/reviews.php`
- They are on DIFFERENT ports but same domain

### Project Must Be in XAMPP
- PHP files MUST be in `C:\xampp\htdocs\` folder
- This is where Apache looks for files
- Your current location (`E:\`) is NOT accessible to Apache

### After Moving
- Delete old folder from `E:\Bongoboltu Travel Website\` (optional, to avoid confusion)
- Always open project from new location: `C:\xampp\htdocs\bangla-travel-hub-main\`

---

✅ **Follow these steps and your 404 error will be fixed!**
