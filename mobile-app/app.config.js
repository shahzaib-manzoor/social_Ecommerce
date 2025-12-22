export default {
  expo: {
    name: "Social E-Commerce",
    slug: "social-ecommerce-app",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: ["**/*"],
    plugins: [
      "expo-dev-client"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.socialecommerce.app"
    },
    android: {
      package: "com.socialecommerce.app",
      permissions: []
    }
  }
};
