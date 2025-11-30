# Authentication Flow Documentation

## How the Login & Profile System Works

### First Time User (Registration → Profile Setup → Dashboard)

1. **Registration**
   - User clicks "Create Account" on login page
   - Enters email and password
   - System creates account with `profileComplete: false`
   - Automatically redirects to ProfileSetup

2. **Profile Setup**
   - User fills in required information (name, phone, etc.)
   - Email field is read-only (locked to registration email)
   - System saves profile data and sets `profileComplete: true`
   - Redirects to Dashboard

3. **Logout**
   - User can logout from dashboard
   - Returns to login page

### Returning User (Login → Dashboard)

1. **Login**
   - User enters email and password
   - System finds account in database
   - **Checks `profileComplete` status:**
     - If `false`: Shows ProfileSetup
     - If `true`: Goes directly to Dashboard ✓

2. **Dashboard**
   - User has full access to their features
   - Profile data is preserved from previous session

## Key Features

✅ Profile data persists between sessions
✅ Completed profiles skip ProfileSetup on subsequent logins
✅ Email cannot be changed after registration
✅ Phone number validation (10 digits)
✅ Role-based access (Admin vs Student)

## Data Storage

All user accounts and their profile data are stored in the `accounts` array in App.tsx state. When a user completes their profile, the account is updated with:
- All profile information
- `profileComplete: true` flag

This ensures that on the next login, the system recognizes the profile is complete and goes directly to the dashboard.
