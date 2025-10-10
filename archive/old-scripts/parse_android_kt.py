#!/usr/bin/env python3

import json
import pandas as pd

# Read Android sheet
df = pd.read_excel('/Users/j3r/ReFit/data/private/KT Corp - PPL ( USED ) #20250806.02.xlsx', sheet_name='Used Android')

# Find model rows
android_data = []
current_model = None

print("First 20 rows to understand structure:")
for i in range(min(20, len(df))):
    row = df.iloc[i]
    print(f"Row {i}: {row.iloc[0]} | {row.iloc[1] if len(row) > 1 else ''}")

print("\n" + "="*50 + "\n")

# More robust parsing
for idx, row in df.iterrows():
    # Check if this looks like a model row
    first_col = str(row.iloc[0]) if pd.notna(row.iloc[0]) else ''
    second_col = str(row.iloc[1]) if len(row) > 1 and pd.notna(row.iloc[1]) else ''
    
    # Skip header rows
    if 'Model' in first_col or 'MSRP' in str(row.iloc[1] if len(row) > 1 else ''):
        continue
    
    # Model detection - look for known brands or patterns
    is_model = False
    if first_col and not any(x in first_col for x in ['GB', 'TB', '$']):
        # Check if it looks like a phone model
        if any(brand in first_col.upper() for brand in ['GALAXY', 'PIXEL', 'ONEPLUS', 'MOTO', 'G ', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S20', 'S21', 'S22', 'S23', 'S24', 'NOTE', 'FOLD', 'FLIP', 'A1', 'A2', 'A3', 'A5', 'A7']):
            is_model = True
            current_model = first_col.strip()
            # Clean up Samsung prefix if redundant
            if 'GALAXY' in current_model.upper():
                current_model = current_model.replace('Samsung ', '').replace('SAMSUNG ', '').strip()
            continue
    
    # Storage row detection - check if first column has storage
    if current_model and ('GB' in first_col or 'TB' in first_col):
        storage = first_col.strip()
        
        # Extract prices from columns (they should be in columns 2-6)
        prices = {}
        col_mapping = {2: 'A', 3: 'B+', 4: 'B', 5: 'C', 6: 'D'}
        
        for col_idx, grade in col_mapping.items():
            if col_idx < len(row):
                val = row.iloc[col_idx]
                if pd.notna(val):
                    try:
                        # Clean and convert price
                        price_str = str(val).replace(',', '').replace('$', '').strip()
                        if price_str and price_str[0].isdigit():
                            price = float(price_str)
                            if price > 0:
                                prices[grade] = price
                    except:
                        pass
        
        if prices and len(prices) >= 3:  # Need at least 3 grades to be valid
            android_data.append({
                'model': current_model,
                'storage': storage,
                'prices': prices,
                'lock_status': 'Unlocked'
            })

# Group by model to identify popular ones
model_groups = {}
for item in android_data:
    model = item['model']
    if model not in model_groups:
        model_groups[model] = []
    model_groups[model].append(item)

print(f'Found {len(android_data)} Android configurations')
print(f'Unique models: {len(model_groups)}')

# Show top models by average price (higher price = more popular/newer)
model_avg_prices = []
for model, variants in model_groups.items():
    avg_price = sum(v['prices'].get('B', 0) for v in variants) / len(variants) if variants else 0
    model_avg_prices.append((model, avg_price, len(variants)))

model_avg_prices.sort(key=lambda x: x[1], reverse=True)

print('\nTop 15 Android models by value:')
for i, (model, avg_price, variant_count) in enumerate(model_avg_prices[:15]):
    print(f'{i+1}. {model} (${avg_price:.0f} avg, {variant_count} variants)')

# Save parsed Android data
output_data = {
    'vendor': 'KT Corp',
    'date': '2025-08-06', 
    'androids': android_data
}

with open('/Users/j3r/ReFit/data/private/kt-android-parsed.json', 'w') as f:
    json.dump(output_data, f, indent=2)

print(f'\n✅ Saved {len(android_data)} Android configurations to kt-android-parsed.json')