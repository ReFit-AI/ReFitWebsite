# Archived Features

## Shop Feature
**Date Archived:** January 2025  
**Reason:** No inventory available yet  
**Files:**
- `shop-page.js` - The complete shop page with Solana phone listings

### To Re-enable Shop:
1. Move `shop-page.js` back to `/app/(routes)/shop/page.js`
2. Uncomment shop references in `/components/Layout.jsx`:
   - Import ShoppingCart icon
   - Add shop back to secondaryNav array
   - Uncomment shop link in footer

### Shop Features (When Ready):
- Product listings for Solana phones
- New and refurbished categories
- SOL payment integration
- Product ratings and reviews
- Warranty information

### Notes:
The shop page is fully built with:
- Solana Saga and Seeker phone listings
- Category filters (All/New/Refurbished)
- Product cards with features and pricing
- SOL and USD pricing display
- Availability status indicators
- Star ratings system

Keep this code for when ReFit has actual inventory to sell.

---

## Email Capture Component
**Date Archived:** January 2025  
**Reason:** Integrated directly into homepage FAQ section  
**Files:**
- `EmailCapture.jsx` - Standalone email capture component

### Original Features:
- Early access countdown timer
- Gradient design with animations
- Form validation
- Responsive layout

### Current Implementation:
Email capture is now integrated directly into the FAQ section on the homepage for better flow and less redundancy.
