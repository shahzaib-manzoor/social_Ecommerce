# Fix Navigation Error - SearchUsers Screen

## What We Fixed

Added the `SearchUsersScreen` to **ALL** stack navigators to ensure it's accessible from any tab:
- ✅ FriendsStackNavigator (primary location)
- ✅ HomeStackNavigator 
- ✅ CartStackNavigator
- ✅ ProfileStackNavigator

## How to Apply the Fix

### Method 1: Complete Cache Clear (Recommended)

```bash
# Stop Metro if running (Ctrl+C)

# Clear all caches
rm -rf node_modules/.cache
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/react-* 2>/dev/null || true

# Restart with clean cache
npx expo start --clear
```

### Method 2: Quick Restart

```bash
# Stop Metro (Ctrl+C)
npx expo start -c
```

### Method 3: Nuclear Option (if above don't work)

```bash
# Stop Metro (Ctrl+C)

# Clear everything
rm -rf node_modules/.cache
rm -rf .expo

# Reinstall dependencies
npm install

# Start fresh
npx expo start --clear
```

## After Restart

1. **Wait** for Metro to finish bundling (100%)
2. In Metro terminal, press **`r`** to reload
3. Or shake device → tap **"Reload"**
4. Clear app data on device (optional but helpful):
   - iOS: Uninstall and reinstall app
   - Android: Settings → Apps → Your App → Storage → Clear Data

## Test the Fix

1. Open the app
2. Go to **Friends** tab
3. Tap the **search icon** (top right)
4. Should open SearchUsers screen ✅

## Still Not Working?

If you still see the error after all above steps:

### Check Metro Output
Look for any red errors in the Metro terminal about:
- Missing modules
- TypeScript errors
- Import errors

### Force Reload on Device
- **iOS**: Cmd+R in simulator, or shake physical device
- **Android**: RR (double tap R) in emulator, or shake physical device

### Check App is Using New Code
Add a console.log to verify:
1. Open `src/navigation/FriendsStackNavigator.tsx`
2. Add: `console.log('FriendsStackNavigator loaded with SearchUsers');`
3. Reload app
4. Check Metro logs for the message

### Last Resort
```bash
# Completely remove and reinstall
rm -rf node_modules package-lock.json
npm install
npx expo start -c
```
