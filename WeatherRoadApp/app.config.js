export default ({ config }) => {
  // Perskaityti .env failą rankiniu būdu
  const dotenv = require('dotenv');
  const fs = require('fs');
  const path = require('path');
  
  // Bandyti nuskaityti .env failą
  const envPath = path.resolve(__dirname, '.env');
  let envVars = {};
  
  if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    envVars = envConfig;
    console.log('✅ .env failas nuskaitytas');
  } else {
    console.log('⚠️ .env failas nerastas');
  }
  
  return {
    ...config,
    expo: {
      name: "WeatherRoadApp",
      slug: "weather-road-app",
      version: "1.0.0",
      sdkVersion: "54.0.0",
      orientation: "portrait",
      userInterfaceStyle: "light",
      assetBundlePatterns: [
        "**/*"
      ],
      ios: {
        supportsTablet: true,
        bundleIdentifier: "com.yourcompany.weatherroadapp",
      },
      android: {
        package: "com.yourcompany.weatherroadapp",
        permissions: [
          "ACCESS_FINE_LOCATION",
          "ACCESS_COARSE_LOCATION"
        ]
      },
      plugins: [
        [
          "expo-location",
          {
            locationAlwaysAndWhenInUsePermission: "Leisti $(PRODUCT_NAME) naudoti jūsų vietą."
          }
        ]
      ],
      extra: {
        OPENWEATHER_API_KEY: envVars.OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY,
        FIREBASE_API_KEY: envVars.FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
        FIREBASE_AUTH_DOMAIN: envVars.FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
        FIREBASE_PROJECT_ID: envVars.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
        FIREBASE_STORAGE_BUCKET: envVars.FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
        FIREBASE_MESSAGING_SENDER_ID: envVars.FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
        FIREBASE_APP_ID: envVars.FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
        FIREBASE_DATABASE_URL: envVars.FIREBASE_DATABASE_URL || process.env.FIREBASE_DATABASE_URL
      }
    }
  };
};