# 📱 ReFit Mobile App

The ReFit mobile app has been moved to its own repository for better code organization and independent development.

## 🔗 New Repository Location
**GitHub:** https://github.com/ReFit-AI/ReFit-Mobile

## 🚀 Why Separate Repositories?

1. **Independent Deployment** - Mobile and web can release on different schedules
2. **Clean Separation** - Different tech stacks (React Native vs Next.js)
3. **Better CI/CD** - Faster builds without mobile dependencies
4. **Team Collaboration** - Mobile team can work independently
5. **Smaller Clone Size** - Web developers don't need mobile dependencies

## 📦 What Was Moved?

The entire `mobile/ReFitMobile` folder containing:
- React Native application code
- iOS and Android native configurations
- Mobile-specific dependencies and configs
- Build scripts and documentation

## 🔧 For Developers

### Clone the Mobile Repository
```bash
git clone https://github.com/ReFit-AI/ReFit-Mobile.git
cd ReFit-Mobile
npm install
```

### Run the Mobile App
```bash
# iOS
npx pod-install
npm run ios

# Android
npm run android
```

## 📡 API Integration

The mobile app connects to the same backend APIs as the web application:
- Base URL: `https://www.shoprefit.com/api`
- Authentication: Supabase
- Payments: Solana blockchain

## 📝 Documentation

For mobile-specific documentation, see the README in the mobile repository:
https://github.com/ReFit-AI/ReFit-Mobile/blob/main/README.md

## 🤝 Contributing

Please submit mobile app issues and PRs to the mobile repository:
https://github.com/ReFit-AI/ReFit-Mobile/issues

---

**Last Updated:** January 2025  
**Maintained By:** ReFit Engineering Team