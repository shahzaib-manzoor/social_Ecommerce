# Admin Access Information

## Admin Credentials

**Email:** `admin@socialecommerce.com`
**Password:** `Admin@123`

## Access Points

### 1. Admin Web Panel
- **URL:** http://localhost:3000
- **Status:** ✅ Running
- **Use:** Product management, image uploads, admin dashboard

### 2. Backend API
- **URL:** http://localhost:5002/api/v1
- **Status:** ✅ Running
- **Test Login:**
  ```bash
  curl -X POST http://localhost:5002/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@socialecommerce.com","password":"Admin@123"}'
  ```

### 3. Mobile App
- **Status:** ✅ Running on Android Emulator
- **API URL:** http://192.168.100.145:5002/api/v1
- **You can also login with admin credentials in the mobile app**

## Quick Start

1. **Access Admin Panel:**
   - Open browser: http://localhost:3000
   - Login with admin credentials above
   - You can now add/edit/delete products

2. **Test Mobile App:**
   - Mobile app is running on Android emulator
   - Login with admin credentials
   - Browse products added through admin panel

3. **Create Regular User:**
   - Use mobile app to register a new user
   - Test social features (friends, messaging)

## Services Status

| Service | Port | Status | Command to Start |
|---------|------|--------|-----------------|
| Backend API | 5002 | ✅ Running | `cd backend && npm run dev` |
| Admin Panel | 3000 | ✅ Running | `cd admin-web && npm run dev` |
| Mobile App | 8081 | ✅ Running | `cd mobile-app && npm start` |
| MongoDB | 27017 | ✅ Running | `brew services start mongodb-community` |

## Important Notes

- **Admin Role:** The admin user has full access to create, edit, and delete products
- **Image Upload:** Configure Cloudinary credentials in `backend/.env` for image uploads
- **Semantic Search:** Configure OpenAI API key in `backend/.env` for semantic product search
- **Mobile App:** Uses custom development client (not Expo Go) to avoid permission issues

## Next Steps

1. ✅ Login to admin panel
2. ✅ Add some products with images
3. ✅ Test mobile app browsing
4. Create regular users and test social features
5. Test friend requests and messaging
6. Test shopping cart and checkout flow

---

Generated: 2025-12-21
All services are running and ready to use!
