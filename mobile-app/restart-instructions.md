# Fix for SearchUsers Navigation Error

The error occurs because Metro bundler needs to restart to pick up the new SearchUsersScreen.

## Solution 1: Restart Metro (Recommended)
1. Stop the current Metro bundler (Ctrl+C in the terminal running `npm start`)
2. Clear the cache and restart:
   ```bash
   npm start -- --reset-cache
   ```
3. Reload your app (shake device and tap "Reload" or press 'r' in Metro terminal)

## Solution 2: Quick Reload
If Metro is running:
1. In the Metro terminal, press 'r' to reload
2. Or shake the device and tap "Reload"

## Verification
Once restarted, the search icon in Friends screen should navigate to the SearchUsers screen without errors.
