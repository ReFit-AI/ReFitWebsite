# ReFit Mobile App Preview

## 📱 App Screens

### 1. Home Screen
- **Wallet Connection**: Connect using Solana Mobile Wallet Adapter
- **Main CTA**: "Turn Your Old Phone into SOL"
- **Features**:
  - 📸 Scan Your Phone - V3RA AI assessment
  - ⚡ Get Instant Quote - SOL valuation
  - 📦 Ship & Get Paid - Free shipping
- **Seed Vault Badge**: Shows compatibility with Saga/Seeker

### 2. Scan Phone Screen
- Phone details form (will be camera scan in production)
- Fields: Brand, Model, Storage, Carrier, Condition
- Submit for instant quote

### 3. Quote Screen
- Large SOL amount display (e.g., "2.8 SOL")
- USD equivalent shown
- Device details breakdown
- Real-time SOL price
- Accept/Decline buttons

### 4. Shipping Screen
- Success confirmation
- Step-by-step instructions:
  1. Pack Your Phone
  2. Print Shipping Label
  3. Drop Off Package
  4. Get Paid in SOL

## 🎨 Design Theme
- **Background**: Pure black (#000)
- **Primary Colors**: 
  - Solana Purple (#9945FF)
  - Solana Green (#14F195)
- **Typography**: Bold, modern, high contrast
- **UI Elements**: Rounded corners, gradient accents

## 🔐 Security Features
- Seed Vault integration for key storage
- Session-based authentication
- 7-day token expiry
- Secure API communication

## 🚀 Technical Stack
- React Native 0.80.0
- TypeScript
- Solana Mobile SDK
- React Navigation
- Axios for API calls
- AsyncStorage for session management

## 📡 API Integration
Connects to existing ReFit backend:
- `/api/mobile/v1/auth/connect` - Wallet auth
- `/api/mobile/v1/phone/models` - Phone models
- `/api/mobile/v1/phone/quote` - Price quotes

## 🎯 Ready for Solana Mobile Store
The app is structured and ready for deployment to:
- Solana Saga phones
- Solana Seeker phones
- Any Android device with Solana wallet