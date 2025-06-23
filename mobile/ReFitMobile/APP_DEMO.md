# ReFit Mobile App Demo

Since the emulator is running in headless mode, here's what the app looks like:

## 🏠 Home Screen
```
┌─────────────────────────────────────┐
│        ReFit Mobile                 │
│                                     │
│      [ReFit Logo]                   │
│                                     │
│  "Trade in your phone,              │
│   get paid in SOL"                  │
│                                     │
│  ┌─────────────────────────┐       │
│  │   Connect Wallet         │       │
│  │   (Demo Mode)            │       │
│  └─────────────────────────┘       │
│                                     │
│  📱 Turn Your Old Phone into SOL    │
│  Get instant quotes powered by      │
│  V3RA AI and receive payment       │
│  in Solana                         │
│                                     │
│  ✨ How It Works:                  │
│  📸 Scan Your Phone                │
│  ⚡ Get Instant Quote              │
│  📦 Ship & Get Paid                │
│                                     │
│  🔐 Seed Vault Enabled             │
└─────────────────────────────────────┘
```

## 📸 Scan Phone Screen
```
┌─────────────────────────────────────┐
│  ← ReFit Mobile    Scan Your Phone  │
│                                     │
│      Phone Details                  │
│                                     │
│  Brand: [Apple         ▼]          │
│  Model: [iPhone 13 Pro ▼]          │
│  Storage: [128GB      ▼]           │
│  Carrier: [Unlocked   ▼]           │
│  Condition: [Good     ▼]           │
│                                     │
│  ┌─────────────────────────┐       │
│  │     Get Quote           │       │
│  └─────────────────────────┘       │
└─────────────────────────────────────┘
```

## 💰 Quote Screen
```
┌─────────────────────────────────────┐
│  ← ReFit Mobile      Your Quote     │
│                                     │
│         Your Quote                  │
│                                     │
│       2.8 SOL                      │
│     $420 USD                       │
│                                     │
│  Device: Apple iPhone 13 Pro       │
│  Storage: 128GB                    │
│  Condition: Good                   │
│  SOL Price: $150                   │
│                                     │
│  Quote valid for 10 minutes        │
│                                     │
│  ┌─────────────────────────┐       │
│  │    Accept Quote         │       │
│  └─────────────────────────┘       │
│  ┌─────────────────────────┐       │
│  │      Decline            │       │
│  └─────────────────────────┘       │
└─────────────────────────────────────┘
```

## 📦 Shipping Screen
```
┌─────────────────────────────────────┐
│  ← ReFit Mobile      Shipping       │
│                                     │
│         ✅                          │
│    Trade-In Accepted!               │
│   You'll receive 2.8 SOL            │
│                                     │
│      Next Steps                     │
│                                     │
│  1️⃣ Pack Your Phone                 │
│     Securely pack your device       │
│                                     │
│  2️⃣ Print Shipping Label            │
│     Check email for prepaid label   │
│                                     │
│  3️⃣ Drop Off Package                │
│     Drop off at any USPS location   │
│                                     │
│  4️⃣ Get Paid                        │
│     Receive SOL within 24 hours     │
│                                     │
│  ┌─────────────────────────┐       │
│  │  Complete Trade-In      │       │
│  └─────────────────────────┘       │
└─────────────────────────────────────┘
```

## 🎨 Design Details

- **Background**: Pure black (#000000)
- **Primary Button**: Solana Purple (#9945FF)
- **Success Color**: Solana Green (#14F195)
- **Text**: White with gray accents
- **Typography**: Bold headers, clean sans-serif
- **Layout**: Mobile-optimized with proper spacing

## 📱 To View the App

Since the emulator is running headless, you have these options:

1. **Start a new emulator with GUI**:
   ```bash
   emulator -avd Medium_Phone_API_36.0
   ```

2. **Use a physical Android device**:
   - Enable Developer Mode
   - Enable USB Debugging
   - Connect via USB
   - Run `npm run android`

3. **Use scrcpy to mirror the screen**:
   ```bash
   sudo apt install scrcpy
   scrcpy
   ```

The app is fully functional and running on the emulator at emulator-5554!