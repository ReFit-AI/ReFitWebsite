#!/usr/bin/env python3
"""
Parse Android pricing from KT Corp and Sell Atlas CSVs
Outputs to existing JSON format for compatibility
"""

import csv
import json
import re
from pathlib import Path

def clean_price(price_str):
    """Clean price string to float"""
    if not price_str or price_str == '':
        return None
    # Remove $, commas, and whitespace
    cleaned = str(price_str).replace('$', '').replace(',', '').strip()
    try:
        return float(cleaned)
    except:
        return None

def parse_kt_android_csv(filepath):
    """Parse KT Corp Android CSV format"""
    androids = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    current_model = None
    i = 0
    
    while i < len(lines):
        line = lines[i].strip()
        
        # Skip empty lines
        if not line:
            i += 1
            continue
        
        # Check for Galaxy model
        if line.startswith('GALAXY'):
            current_model = line.strip()
            i += 1
            continue
        
        # Skip deduction lines
        if 'DEDUCTION' in line or 'MISSING STYLUS' in line:
            i += 1
            continue
        
        # Parse pricing rows
        if current_model and ',' in line:
            parts = line.split(',')
            
            # Check if this looks like a price row
            if len(parts) >= 6 and ('UNLOCKED' in parts[1] or 'LOCKED' in parts[1]):
                # Extract storage and lock status from description
                desc = parts[1].strip()
                
                storage_match = re.search(r'(\d+GB|\d+TB)', desc)
                storage = storage_match.group(1) if storage_match else None
                
                if 'UNLOCKED' in desc:
                    lock_status = 'Unlocked'
                else:
                    lock_status = 'Carrier Locked'
                
                if storage:
                    # Parse prices for each grade
                    prices = {}
                    grade_map = {2: 'A', 3: 'B+', 4: 'B', 5: 'C', 6: 'D'}
                    
                    for col, grade in grade_map.items():
                        if col < len(parts):
                            price = clean_price(parts[col])
                            if price:
                                prices[grade] = price
                    
                    if prices:
                        androids.append({
                            'model': current_model,
                            'storage': storage,
                            'lock_status': lock_status,
                            'prices': prices
                        })
        i += 1
    
    return {'androids': androids}

def parse_sa_android_csv(filepath):
    """Parse Sell Atlas CSV for Android phones"""
    androids = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)
    
    # Find header row
    header_row_idx = None
    for i, row in enumerate(rows):
        if any('Grade A' in str(cell) for cell in row):
            header_row_idx = i
            break
    
    if not header_row_idx:
        return {'androids': []}
    
    # Parse pricing rows
    for i in range(header_row_idx + 1, len(rows)):
        row = rows[i]
        if len(row) < 7:
            continue
        
        model = row[1].strip() if len(row) > 1 else ''
        
        # Only process Galaxy/Android rows
        if 'Galaxy' not in model and 'GALAXY' not in model:
            continue
        
        # Parse model details
        storage = None
        lock_status = 'Unlocked'
        
        # Extract storage
        storage_match = re.search(r'(\d+GB|\d+TB)', model)
        if storage_match:
            storage = storage_match.group(1)
        
        # Check lock status
        if 'Carrier' in model or 'Locked' in model:
            lock_status = 'Carrier Locked'
        
        if not storage:
            continue
        
        # Clean model name
        clean_model = re.sub(r'\d+GB|\d+TB|Unlocked|Carrier Locked', '', model).strip()
        
        # Parse prices
        prices = {}
        grade_map = {3: 'A', 4: 'B', 5: 'C', 6: 'D'}
        
        for col, grade in grade_map.items():
            if col < len(row):
                price = clean_price(row[col])
                if price:
                    prices[grade] = price
        
        # Add B+ as average
        if 'A' in prices and 'B' in prices:
            prices['B+'] = round((prices['A'] + prices['B']) / 2)
        
        if prices:
            androids.append({
                'model': clean_model,
                'storage': storage,
                'lock_status': lock_status,
                'prices': prices
            })
    
    return {'androids': androids}

def main():
    all_androids = []
    
    # Parse KT Android CSV
    kt_file = Path('/Users/j3r/ReFit/PriceLists/KT_Android.csv')
    if kt_file.exists():
        print(f"Parsing KT Android: {kt_file}")
        kt_data = parse_kt_android_csv(kt_file)
        all_androids.extend(kt_data['androids'])
        print(f"  Found {len(kt_data['androids'])} Android models")
    
    # Parse Sell Atlas CSV (also has Android)
    sa_file = Path('/Users/j3r/ReFit/PriceLists/SA_9.30 - Sheet1.csv')
    if sa_file.exists():
        print(f"Parsing Sell Atlas Android: {sa_file}")
        sa_data = parse_sa_android_csv(sa_file)
        all_androids.extend(sa_data['androids'])
        print(f"  Found {len(sa_data['androids'])} Android models")
    
    # Remove duplicates and merge prices
    merged = {}
    for device in all_androids:
        key = f"{device['model']}_{device['storage']}_{device['lock_status']}"
        if key not in merged:
            merged[key] = device
        else:
            # Merge prices, taking the max
            for grade, price in device['prices'].items():
                if grade not in merged[key]['prices'] or price > merged[key]['prices'][grade]:
                    merged[key]['prices'][grade] = price
    
    # Convert back to list
    androids = list(merged.values())
    
    # Sort by model and storage
    androids.sort(key=lambda x: (
        x['model'],
        int(re.search(r'\d+', x['storage']).group()) if re.search(r'\d+', x['storage']) else 0,
        x['lock_status']
    ))
    
    # Save to JSON
    output_file = Path('/Users/j3r/ReFit/data/supplier-pricing-androids-updated.json')
    with open(output_file, 'w') as f:
        json.dump({'androids': androids}, f, indent=2)
    
    print(f"\n✅ Saved {len(androids)} Android models to {output_file}")
    
    # Show sample data
    print("\n=== SAMPLE ANDROID DATA ===")
    for device in androids[:5]:
        print(f"\n{device['model']} - {device['storage']} ({device['lock_status']})")
        for grade, price in sorted(device['prices'].items()):
            print(f"  Grade {grade}: ${price:.0f}")

if __name__ == '__main__':
    main()