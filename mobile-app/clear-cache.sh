#!/bin/bash
echo "🧹 Clearing all caches..."

# Clear watchman cache
echo "Clearing watchman..."
watchman watch-del-all 2>/dev/null || echo "Watchman not available, skipping..."

# Clear Metro bundler cache
echo "Clearing Metro cache..."
rm -rf $TMPDIR/react-* 2>/dev/null || true
rm -rf $TMPDIR/metro-* 2>/dev/null || true

# Clear node_modules cache
echo "Clearing node_modules cache..."
rm -rf node_modules/.cache

# Clear expo cache
echo "Clearing Expo cache..."
npx expo start --clear &

echo ""
echo "✅ Cache cleared! Metro is starting..."
echo ""
echo "After Metro starts:"
echo "1. Press 'r' to reload"
echo "2. Or shake device and tap 'Reload'"
