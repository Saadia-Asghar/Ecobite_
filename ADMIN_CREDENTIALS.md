# Admin Credentials

## Login Information
- **Email:** `admin@ecobite.com`
- **Password:** `Admin@123`

## Verification
The admin user is automatically created when the server starts.

To verify the admin user exists, visit:
```
http://localhost:3002/api/auth/test-admin
```

This should return:
```json
{
  "exists": true,
  "admin": {
    "id": "admin-xxxxx",
    "email": "admin@ecobite.com",
    "name": "Admin User",
    "type": "admin"
  },
  "passwordTest": {
    "testPassword": "Admin@123",
    "isValid": true,
    "message": "Password matches!"
  }
}
```

## Troubleshooting

If login fails:
1. Check the server console for login logs
2. Verify the test endpoint shows `isValid: true`
3. Restart the server to recreate the admin user
4. Check browser console for any errors

## Server Logs to Check

When logging in, you should see:
```
=== LOGIN REQUEST ===
Request body: { email: 'admin@ecobite.com', password: 'Admin@123' }
Email: admin@ecobite.com
Password length: 9
Login attempt for: admin@ecobite.com
User found: YES
Comparing password...
Password valid: true
```

If you see "User found: NO" or "Password valid: false", there's an issue with the database.
