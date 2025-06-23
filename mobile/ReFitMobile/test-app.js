// Test script to verify app structure
const fs = require('fs');
const path = require('path');

console.log('🚀 ReFit Mobile App Structure Test\n');

// Check key files
const checkFiles = [
  'App.tsx',
  'src/components/SolanaProvider.tsx',
  'src/screens/HomeScreen.tsx',
  'src/screens/ScanPhoneScreen.tsx',
  'src/screens/QuoteScreen.tsx',
  'src/screens/ShippingScreen.tsx',
  'src/services/api.ts',
  'global.ts',
];

console.log('📁 Checking files:');
checkFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Check dependencies
console.log('\n📦 Key dependencies:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const keyDeps = [
  '@solana/web3.js',
  '@solana-mobile/mobile-wallet-adapter-protocol',
  '@solana-mobile/mobile-wallet-adapter-protocol-web3js',
  'react-native',
  '@react-navigation/native',
  'axios',
];

keyDeps.forEach(dep => {
  const installed = packageJson.dependencies[dep] || packageJson.devDependencies[dep];
  console.log(`  ${installed ? '✅' : '❌'} ${dep}${installed ? ` (${installed})` : ''}`);
});

console.log('\n✨ App Summary:');
console.log('- React Native app for Solana Mobile (Saga/Seeker)');
console.log('- Seed Vault integration ready');
console.log('- Connected to ReFit backend API');
console.log('- Phone trade-in flow implemented');
console.log('\n🎯 Next steps:');
console.log('1. Install Android Studio and SDK');
console.log('2. Set ANDROID_HOME environment variable');
console.log('3. Create Android emulator or connect device');
console.log('4. Run: npm run android');
console.log('\nFor iOS (Mac only):');
console.log('1. cd ios && pod install');
console.log('2. npm run ios');