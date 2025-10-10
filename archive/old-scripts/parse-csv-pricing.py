#!/usr/bin/env python3
"""
Parse CSV pricing from KT Corp and Sell Atlas
Outputs to existing JSON format for compatibility
"""

import csv
import json
import re
import sys
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

def parse_kt_corp_csv(filepath, phone_type='iphone'):
    """Parse KT Corp CSV format for iPhones or Android"""
    phones = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    current_model = None
    current_deductions = {}
    i = 0
    
    while i < len(lines):
        line = lines[i].strip()
        
        # Skip empty lines
        if not line:
            i += 1
            continue
            
        # Check for iPhone model
        if phone_type == 'iphone' and line.startswith('USED IPHONE'):
            # Extract model name
            model_match = re.search(r'USED IPHONE (.+)', line)
            if model_match:
                model_name = model_match.group(1).strip()
                # Convert to standard format
                current_model = f'iPhone {model_name}'
            i += 1
            continue
        
        # Check for Android model (Galaxy phones)
        if phone_type == 'android' and line.startswith('GALAXY'):
            current_model = line.strip()
            i += 1
            continue
        
        # Skip deduction blocks (we'll handle these separately)
        if 'MDM Locked' in line or 'Unknown Parts' in line:
            # Skip the entire deduction block
            while i < len(lines) and lines[i].strip() and 'UNLOCKED' not in lines[i] and 'locked' not in lines[i]:
                i += 1
            continue
        
        # Check for lock status and pricing data
        if ('UNLOCKED' in line or 'Sim locked' in line) and current_model:
            lock_status = 'Unlocked' if 'UNLOCKED' in line else 'Carrier Locked'
            
            # Next lines should be pricing data
            i += 1
            while i < len(lines):
                row = lines[i].strip()
                if not row:
                    break
                    
                parts = row.split(',')
                if len(parts) >= 7 and ('GB' in parts[1] or 'TB' in parts[1]):
                    storage = parts[1].strip()
                    
                    # Parse prices for each grade
                    prices = {}
                    grade_map = {2: 'A', 3: 'B+', 4: 'B', 5: 'C', 6: 'D'}
                    
                    for col, grade in grade_map.items():
                        if col < len(parts):
                            price = clean_price(parts[col])
                            if price:
                                prices[grade] = price
                    
                    if prices:
                        iphones.append({
                            'model': current_model,
                            'storage': storage,
                            'lock_status': lock_status,
                            'prices': prices
                        })
                i += 1
        else:
            i += 1
    
    return {'iphones': iphones}

def parse_sell_atlas_csv(filepath):
    """Parse Sell Atlas CSV format"""
    iphones = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)
    
    # Find header row with grade columns
    header_row_idx = None
    for i, row in enumerate(rows):
        if any('Grade A' in str(cell) for cell in row):
            header_row_idx = i
            break
    
    if not header_row_idx:
        print("Could not find header row in Sell Atlas CSV")
        return {'iphones': []}
    
    # Parse pricing rows
    for i in range(header_row_idx + 1, len(rows)):
        row = rows[i]
        if len(row) < 7:
            continue
            
        model = row[1].strip() if len(row) > 1 else ''
        
        # Only process iPhone rows
        if 'iPhone' not in model:
            continue
            
        # Parse model details
        model_parts = model.split()
        if len(model_parts) < 3:
            continue
            
        # Extract storage and lock status
        storage = None
        lock_status = 'Unlocked'
        
        for part in model_parts:
            if 'GB' in part or 'TB' in part:
                storage = part
            if 'Carrier' in model or 'Locked' in model:
                lock_status = 'Carrier Locked'
        
        if not storage:
            continue
            
        # Clean model name (remove storage and lock status)
        clean_model = model.replace(storage, '').replace('Unlocked', '').replace('Carrier Locked', '').strip()
        
        # Parse prices
        prices = {}
        # Sell Atlas columns: Model, SWAP/HSO, Grade A, Grade B, Grade C, Grade D, DOA
        grade_map = {
            3: 'A',
            4: 'B',
            5: 'C',
            6: 'D'
        }
        
        for col, grade in grade_map.items():
            if col < len(row):
                price = clean_price(row[col])
                if price:
                    prices[grade] = price
        
        # Also add B+ as average of A and B for compatibility
        if 'A' in prices and 'B' in prices:
            prices['B+'] = round((prices['A'] + prices['B']) / 2)
        
        if prices:
            iphones.append({
                'model': clean_model,
                'storage': storage,
                'lock_status': lock_status,
                'prices': prices
            })
    
    return {'iphones': iphones}

def merge_supplier_data(kt_data, sa_data):
    """Merge data from both suppliers, taking the better price"""
    merged = []
    processed = set()
    
    # Process all devices
    all_devices = kt_data.get('iphones', []) + sa_data.get('iphones', [])
    
    for device in all_devices:
        key = f"{device['model']}_{device['storage']}_{device['lock_status']}"
        
        if key not in processed:
            # Find matching device from other supplier
            matching = [d for d in all_devices if 
                       d['model'] == device['model'] and 
                       d['storage'] == device['storage'] and 
                       d['lock_status'] == device['lock_status']]
            
            if len(matching) > 1:
                # Merge prices, taking the max (best for us)
                merged_prices = {}
                for grade in ['A', 'B+', 'B', 'C', 'D']:
                    prices = [d['prices'].get(grade, 0) for d in matching if grade in d['prices']]
                    if prices:
                        merged_prices[grade] = max(prices)
                
                if merged_prices:
                    merged.append({
                        'model': device['model'],
                        'storage': device['storage'],
                        'lock_status': device['lock_status'],
                        'prices': merged_prices
                    })
            else:
                merged.append(device)
            
            processed.add(key)
    
    return {'iphones': merged}

def main():
    # Parse KT Corp CSV
    kt_file = Path('/Users/j3r/ReFit/PriceLists/KT_9.30 - Sheet1.csv')
    if kt_file.exists():
        print(f"Parsing KT Corp: {kt_file}")
        kt_data = parse_kt_corp_csv(kt_file)
        print(f"  Found {len(kt_data['iphones'])} iPhone models")
    else:
        print(f"KT Corp file not found: {kt_file}")
        kt_data = {'iphones': []}
    
    # Parse Sell Atlas CSV
    sa_file = Path('/Users/j3r/ReFit/PriceLists/SA_9.30 - Sheet1.csv')
    if sa_file.exists():
        print(f"Parsing Sell Atlas: {sa_file}")
        sa_data = parse_sell_atlas_csv(sa_file)
        print(f"  Found {len(sa_data['iphones'])} iPhone models")
    else:
        print(f"Sell Atlas file not found: {sa_file}")
        sa_data = {'iphones': []}
    
    # Merge data from both suppliers
    print("\nMerging supplier data...")
    merged_data = merge_supplier_data(kt_data, sa_data)
    
    # Sort by model and storage
    merged_data['iphones'].sort(key=lambda x: (
        x['model'],
        int(re.search(r'\d+', x['storage']).group()) if re.search(r'\d+', x['storage']) else 0,
        x['lock_status']
    ))
    
    # Save to JSON
    output_file = Path('/Users/j3r/ReFit/data/supplier-pricing-iphones-updated.json')
    with open(output_file, 'w') as f:
        json.dump(merged_data, f, indent=2)
    
    print(f"\n✅ Saved {len(merged_data['iphones'])} iPhone models to {output_file}")
    
    # Show sample data
    print("\n=== SAMPLE DATA ===")
    for device in merged_data['iphones'][:5]:
        print(f"\n{device['model']} - {device['storage']} ({device['lock_status']})")
        for grade, price in sorted(device['prices'].items()):
            print(f"  Grade {grade}: ${price:.0f}")

if __name__ == '__main__':
    main()