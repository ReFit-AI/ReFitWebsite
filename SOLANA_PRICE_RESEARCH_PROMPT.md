# Solana Phone Market Research Prompt - SIMPLIFIED

## Objective
Get simple average resale prices for Solana phones to set buyback prices. No need for collector details - those are just bonus margin.

## Research Instructions

Please find the typical resale prices for:

### 1. Solana Saga (512GB)
- Search eBay "Sold Listings" for "Solana Saga phone"
- Focus on NORMAL used phones (not sealed/collector items)
- Get average prices for:
  - Excellent condition (light use)
  - Good condition (normal wear)
  - Fair condition (heavy wear)

### 2. Solana Seeker (128GB)
- Search eBay "Sold Listings" for "Solana Seeker phone"
- Focus on regular used units
- Get average prices for same conditions

## Data Points Needed (KEEP IT SIMPLE)

For each phone model, just provide:

1. **Typical Resale Prices**:
   - Excellent: $___
   - Good: $___
   - Fair: $___

2. **Quick Market Check**:
   - Most common selling price: $___
   - Are they actually selling? (Yes/No)
   - Rough volume (lots/some/few sales)

3. **5 Recent Normal Sales** (skip collector items):
   - Price and condition only
   - Example: "$450 - Good condition"

## Additional Sources to Check

- StockX (if they list Solana phones)
- Mercari
- Facebook Marketplace
- r/SolanaPhone subreddit for community pricing discussions
- Twitter/X for recent sales announcements

## Simple Output Format

Just give us:

```
SAGA (512GB):
- Excellent: $___
- Good: $___  
- Fair: $___
- Most common price: $___
- Still selling? Yes/No

SEEKER (128GB):
- Excellent: $___
- Good: $___
- Fair: $___
- Most common price: $___
- Still selling? Yes/No
```

## Quick Notes

- Ignore sealed/collector items (that's bonus margin for us)
- Focus on SOLD listings only
- Skip obvious outliers
- If Seeker hasn't launched yet, just note that

That's it! Keep it simple - we just need ballpark resale values to set fair buyback prices.