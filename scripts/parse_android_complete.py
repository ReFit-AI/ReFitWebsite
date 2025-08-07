#!/usr/bin/env python3

import json
import pandas as pd

def parse_android_sheet():
    # Read Android sheet
    df = pd.read_excel('/Users/j3r/ReFit/data/private/KT Corp - PPL ( USED ) #20250806.02.xlsx', sheet_name='Used Android')
    
    android_data = []
    current_model = None
    grade_columns = {}
    
    for idx, row in df.iterrows():
        first_col = str(row.iloc[0]) if pd.notna(row.iloc[0]) else ''
        second_col = str(row.iloc[1]) if len(row) > 1 and pd.notna(row.iloc[1]) else ''
        
        # Detect model name rows (e.g., "GALAXY S24 ULTRA")
        if first_col and 'GALAXY' in first_col.upper() and not any(x in first_col for x in ['DEDUCTION', 'MISSING', 'ATT']):
            current_model = first_col.strip()
            # Clean up model name
            if 'SAMSUNG' in current_model.upper():
                current_model = current_model.replace('Samsung ', '').replace('SAMSUNG ', '')
            continue
        
        # Detect grade header row (contains A, B+, B, C, D)
        if 'A' in str(row.iloc[2]) and 'B+' in str(row.iloc[3]):
            # Map column indices to grades
            grade_columns = {}
            for i in range(2, min(7, len(row))):
                grade = str(row.iloc[i]).strip()
                if grade in ['A', 'B+', 'B', 'C', 'D']:
                    grade_columns[i] = grade
            continue
        
        # Detect storage/variant rows
        if current_model and second_col and ('GB' in second_col or 'TB' in second_col):
            variant_desc = second_col.strip()
            
            # Parse storage amount
            storage = None
            if '128GB' in variant_desc:
                storage = '128GB'
            elif '256GB' in variant_desc:
                storage = '256GB'
            elif '512GB' in variant_desc:
                storage = '512GB'
            elif '1TB' in variant_desc:
                storage = '1TB'
            
            # Parse lock status
            lock_status = 'Unlocked'
            if 'SIM LOCKED' in variant_desc.upper():
                lock_status = 'Carrier Locked'
            elif 'UNLOCKED' not in variant_desc.upper():
                # If not explicitly unlocked and contains carrier info, assume locked
                if 'ATT' in variant_desc or 'VERIZON' in variant_desc or 'T-MOBILE' in variant_desc:
                    lock_status = 'Carrier Locked'
            
            # Extract prices
            prices = {}
            for col_idx, grade in grade_columns.items():
                if col_idx < len(row):
                    val = row.iloc[col_idx]
                    if pd.notna(val):
                        try:
                            price_str = str(val).replace(',', '').replace('$', '').strip()
                            if price_str and price_str.replace('.', '').isdigit():
                                price = float(price_str)
                                if price > 0:
                                    prices[grade] = price
                        except:
                            pass
            
            if storage and prices and len(prices) >= 3:
                android_data.append({
                    'model': current_model,
                    'storage': storage,
                    'lock_status': lock_status,
                    'prices': prices,
                    'variant_desc': variant_desc  # Keep original description for reference
                })
    
    return android_data

# Parse the data
android_data = parse_android_sheet()

# Group by model
model_groups = {}
for item in android_data:
    model = item['model']
    if model not in model_groups:
        model_groups[model] = []
    model_groups[model].append(item)

print(f'✅ Found {len(android_data)} Android configurations')
print(f'✅ Unique models: {len(model_groups)}')

# Show models with average prices
print('\n📱 Android Models Found:')
model_stats = []
for model, variants in model_groups.items():
    # Calculate average B grade price
    avg_b_price = sum(v['prices'].get('B', 0) for v in variants) / len(variants) if variants else 0
    model_stats.append((model, avg_b_price, len(variants)))

# Sort by average price (newest/most valuable first)
model_stats.sort(key=lambda x: x[1], reverse=True)

for i, (model, avg_price, variant_count) in enumerate(model_stats[:20], 1):
    print(f'{i:2d}. {model:30s} - ${avg_price:6.0f} avg - {variant_count} variants')

# Save to JSON
output = {
    'vendor': 'KT Corp',
    'date': '2025-08-06',
    'androids': android_data
}

with open('/Users/j3r/ReFit/data/private/kt-android-parsed.json', 'w') as f:
    json.dump(output, f, indent=2)

print(f'\n✅ Saved to kt-android-parsed.json')

# Show sample data structure
if android_data:
    print('\n📋 Sample data structure:')
    sample = android_data[0]
    print(json.dumps(sample, indent=2))