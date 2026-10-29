module.exports = ({ config }) => ({
  ...config,
  plugins: (config.plugins || []).map((plugin) => plugin === 'expo-build-properties'
    ? ['expo-build-properties', {
      android: {
        usesCleartextTraffic: /^http:\/\/(?:10\.|127\.0\.0\.1|localhost|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/i.test(process.env.EXPO_PUBLIC_API_URL_ANDROID || ''),
      },
    }]
    : plugin),
});
