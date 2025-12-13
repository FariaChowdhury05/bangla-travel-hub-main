# Quick Start - Reviews System

## 5 Minute Setup

### 1. Database Setup (2 min)

```
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Click SQL tab
3. Open database/reviews.sql
4. Copy all content and paste in SQL tab
5. Click Go
```

### 2. Verify Backend Files (1 min)

```
Check these files exist:
- api/config.php ✓
- api/reviews.php ✓
- src/lib/api-config.ts ✓
```

### 3. Start Services (1 min)

```
1. Start Apache in XAMPP Control Panel
2. Start MySQL in XAMPP Control Panel
3. Run: npm run dev (from project root)
```

### 4. Test (1 min)

```
1. Go to http://localhost:5173
2. Click "Review Us" button in Hero section
3. Fill form and submit
4. Check phpMyAdmin - review should be there with status='pending'
5. Change status to 'approved' in phpMyAdmin
6. Refresh page - review appears!
```

---

## Files Created/Modified

### NEW Files:

- `database/reviews.sql` - Database schema
- `api/config.php` - Database connection
- `api/reviews.php` - Review API endpoints
- `src/config/api.ts` - Frontend API config
- `src/components/ReviewFormModal.tsx` - Review form component
- `REVIEWS_SETUP_GUIDE.md` - Full setup guide

### MODIFIED Files:

- `src/components/Reviews.tsx` - Fetches dynamic reviews
- `src/components/Hero.tsx` - Added Review Us button

---

## API Paths

**Backend:** `http://localhost/bangla-travel-hub-main/api/reviews.php`

**Frontend Config:** `src/lib/api-config.ts` → Line ~2: `API_BASE_URL`

---

## Common Issues

| Issue         | Solution                                          |
| ------------- | ------------------------------------------------- |
| CORS Error    | Ensure Apache is running and project is in htdocs |
| Blank reviews | Verify MySQL is running, check phpMyAdmin         |
| Submit fails  | Check all form fields filled, comment 10+ chars   |
| No database   | Run database/reviews.sql in phpMyAdmin            |

---

## Default Login (phpMyAdmin)

- User: `root`
- Password: (leave blank)
- Server: `localhost`

---

## Folder Structure

```
bangla-travel-hub-main/
├── api/                    ← PHP Backend
│   ├── config.php
│   └── reviews.php
├── database/              ← SQL Scripts
│   └── reviews.sql
├── src/
│   ├── components/        ← React Components
│   │   ├── Reviews.tsx (Updated)
│   │   ├── ReviewFormModal.tsx (New)
│   │   └── Hero.tsx (Updated)
│   └── lib/               ← Frontend Config
│       └── api-config.ts (New)
└── REVIEWS_SETUP_GUIDE.md  ← Full Documentation
```

---

## Testing Checklist

- [ ] Database created in phpMyAdmin
- [ ] Apache running
- [ ] MySQL running
- [ ] `npm run dev` working
- [ ] Reviews display on page
- [ ] "Review Us" button visible
- [ ] Form opens when clicked
- [ ] Can submit review
- [ ] Review appears in phpMyAdmin
- [ ] After approval, review displays on page

---

**Ready to go!** For detailed troubleshooting, see REVIEWS_SETUP_GUIDE.md
