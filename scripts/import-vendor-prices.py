#!/usr/bin/env python3

"""
Unified vendor price import script
Imports from both SA (CSV) and KT Corp (Excel) price lists
Focuses on iPhones and Samsung phones only
"""

import pandas as pd
import json
import re
from datetime import datetime
import os

def clean_price(value):
    """Clean and convert price values"""
    if pd.isna(value):
        return None
    if isinstance(value, str):
        if any(x in value.upper() for x in ['OFFER', 'CALL', 'ASK']):
            return None
        value = re.sub(r'[$,]', '', value)
    try:
        price = float(value)
        return price if price > 0 else None
    except:
        return None

def import_sa_prices(csv_file):
    """Import SA iPhone prices from CSV"""
    print("\n📱 Importing SA iPhone prices...")

    iphones = []

    with open(csv_file, 'r') as f:
        lines = f.readlines()

    # Skip header rows (first 11 lines based on previous script)
    for i, line in enumerate(lines[11:], start=11):
        if not line.strip():
            continue

        # Parse CSV line handling commas in quotes
        parts = []
        current = ''
        in_quotes = False

        for char in line:
            if char == '"':
                in_quotes = not in_quotes
            elif char == ',' and not in_quotes:
                parts.append(current.strip())
                current = ''
            else:
                current += char
        parts.append(current.strip())

        if len(parts) < 8 or not parts[1]:
            continue

        # Parse model info
        model_str = parts[1]
        if 'iPhone' not in model_str:
            continue

        # Extract model, storage, lock status
        match = re.search(r'iPhone ([\d\s\w]+?)\s+(\d+GB|\d+TB)\s*(.*)', model_str, re.I)
        if not match:
            continue

        model = f"iPhone {match.group(1).strip()}"
        storage = match.group(2)
        lock_text = match.group(3).lower()
        lock_status = 'Carrier Locked' if 'carrier locked' in lock_text else 'Unlocked'

        # Extract prices (columns: Model, SWAP/HSO, Grade A, Grade B, Grade C, Grade D, DOA)
        prices = {}
        if len(parts) > 3 and parts[3]:
            price_a = clean_price(parts[3])
            if price_a:
                prices['A'] = price_a
                prices['B+'] = price_a  # SA Grade A maps to B+

        if len(parts) > 4 and parts[4]:
            price_b = clean_price(parts[4])
            if price_b:
                prices['B'] = price_b

        if len(parts) > 5 and parts[5]:
            price_c = clean_price(parts[5])
            if price_c:
                prices['C'] = price_c

        if len(parts) > 6 and parts[6]:
            price_d = clean_price(parts[6])
            if price_d:
                prices['D'] = price_d

        if prices and prices.get('B'):  # Must have at least B grade
            iphones.append({
                'model': model,
                'storage': storage,
                'lock_status': lock_status,
                'prices': prices
            })

    print(f"  ✅ Imported {len(iphones)} iPhone variants from SA")
    return iphones

def import_kt_iphones(excel_file):
    """Import KT iPhone prices from Excel"""
    print("\n📱 Importing KT iPhone prices...")

    df = pd.read_excel(excel_file, sheet_name='Used iPhone', header=None)

    iphones = []
    current_model = None

    for idx in range(len(df)):
        row = df.iloc[idx]
        first_col = str(row.iloc[0]) if pd.notna(row.iloc[0]) else ""

        # Check for iPhone model header
        if 'USED IPHONE' in first_col.upper():
            model_str = first_col.replace('USED ', '').strip()
            # Skip notes
            if not any(skip in model_str.upper() for skip in ['MDM', 'UNKNOWN', 'ALL DEVICES']):
                current_model = model_str

        # Check for storage row (has GB/TB and prices)
        elif current_model and pd.notna(row.iloc[1]):
            storage_str = str(row.iloc[1])

            # Check if this is a storage row
            if any(x in storage_str.upper() for x in ['GB', 'TB']):
                # Determine if unlocked or carrier
                prev_row = df.iloc[idx-1] if idx > 0 else None
                is_carrier = False
                if prev_row is not None and pd.notna(prev_row.iloc[0]):
                    prev_text = str(prev_row.iloc[0]).upper()
                    if 'SIM LOCKED' in prev_text or 'CARRIER' in prev_text:
                        is_carrier = True

                # Extract storage and prices
                storage = storage_str.strip()
                lock_status = 'Carrier Locked' if is_carrier else 'Unlocked'

                prices = {}
                # Columns are typically: Storage, A, B+, B, C, D
                if len(row) > 2 and pd.notna(row.iloc[2]):
                    prices['A'] = clean_price(row.iloc[2])
                if len(row) > 3 and pd.notna(row.iloc[3]):
                    prices['B+'] = clean_price(row.iloc[3])
                if len(row) > 4 and pd.notna(row.iloc[4]):
                    prices['B'] = clean_price(row.iloc[4])
                if len(row) > 5 and pd.notna(row.iloc[5]):
                    prices['C'] = clean_price(row.iloc[5])
                if len(row) > 6 and pd.notna(row.iloc[6]):
                    prices['D'] = clean_price(row.iloc[6])

                # Remove None values
                prices = {k: v for k, v in prices.items() if v is not None}

                if prices and prices.get('B'):  # Must have at least B grade
                    iphones.append({
                        'model': current_model,
                        'storage': storage,
                        'lock_status': lock_status,
                        'prices': prices
                    })

    print(f"  ✅ Imported {len(iphones)} iPhone variants from KT")
    return iphones

def import_kt_samsung(excel_file):
    """Import KT Samsung prices from Excel"""
    print("\n🤖 Importing KT Samsung prices...")

    df = pd.read_excel(excel_file, sheet_name='Used Android', header=None)

    samsung_phones = []
    current_model = None

    for idx in range(len(df)):
        row = df.iloc[idx]
        first_col = str(row.iloc[0]) if pd.notna(row.iloc[0]) else ""

        # Check for Galaxy model header
        if 'GALAXY' in first_col.upper():
            if not any(skip in first_col.upper() for skip in ['ALL ANDROID', 'PLEASE', 'FALLS INTO']):
                current_model = first_col.strip()

        # Check for storage row
        elif current_model and pd.notna(row.iloc[1]):
            storage_str = str(row.iloc[1])

            if any(x in storage_str.upper() for x in ['GB', 'TB']):
                # Parse lock status from storage column
                storage_parts = storage_str.upper()
                if 'UNLOCKED' in storage_parts:
                    lock_status = 'Unlocked'
                    storage = re.search(r'(\d+(?:GB|TB))', storage_str).group(1)
                elif 'SIM LOCKED' in storage_parts or 'LOCKED' in storage_parts:
                    lock_status = 'Carrier Locked'
                    storage = re.search(r'(\d+(?:GB|TB))', storage_str).group(1)
                else:
                    continue

                prices = {}
                # Columns: Storage, A, B+, B, C, D
                if len(row) > 2 and pd.notna(row.iloc[2]):
                    prices['A'] = clean_price(row.iloc[2])
                if len(row) > 3 and pd.notna(row.iloc[3]):
                    prices['B+'] = clean_price(row.iloc[3])
                if len(row) > 4 and pd.notna(row.iloc[4]):
                    prices['B'] = clean_price(row.iloc[4])
                if len(row) > 5 and pd.notna(row.iloc[5]):
                    prices['C'] = clean_price(row.iloc[5])
                if len(row) > 6 and pd.notna(row.iloc[6]):
                    prices['D'] = clean_price(row.iloc[6])

                # Remove None values
                prices = {k: v for k, v in prices.items() if v is not None}

                if prices and prices.get('B'):  # Must have at least B grade
                    samsung_phones.append({
                        'model': current_model,
                        'storage': storage,
                        'lock_status': lock_status,
                        'prices': prices
                    })

    print(f"  ✅ Imported {len(samsung_phones)} Samsung variants from KT")
    return samsung_phones

def merge_prices(sa_devices, kt_devices):
    """Merge prices from multiple vendors, keeping best prices"""
    print("\n🔄 Merging prices from vendors...")

    merged = {}

    # Process all devices
    all_devices = []
    for device in sa_devices:
        device['vendor'] = 'SA'
        all_devices.append(device)

    for device in kt_devices:
        device['vendor'] = 'KT'
        all_devices.append(device)

    # Group by unique key
    for device in all_devices:
        key = f"{device['model']}|{device['storage']}|{device['lock_status']}"

        if key not in merged:
            merged[key] = device.copy()
            merged[key]['vendors'] = {device['vendor']: device['prices']}
        else:
            # Merge prices - take the best (highest) for each grade
            merged[key]['vendors'][device['vendor']] = device['prices']

            for grade in ['A', 'B+', 'B', 'C', 'D']:
                current = merged[key]['prices'].get(grade)
                new = device['prices'].get(grade)

                if new and (not current or new > current):
                    merged[key]['prices'][grade] = new

    # Convert back to list
    result = list(merged.values())

    print(f"  ✅ Merged to {len(result)} unique device configurations")
    return result

def main():
    """Main import function"""
    print("="*60)
    print("UNIFIED VENDOR PRICE IMPORT")
    print("="*60)

    # File paths
    sa_csv = '/Users/j3r/ReFit/PriceLists/SA_11.5.2025 - iPhone Used.csv'
    kt_excel = '/Users/j3r/ReFit/PriceLists/KT Corp - PPL ( USED ) #20251105.xlsx'

    try:
        # Import from SA
        sa_iphones = []
        if os.path.exists(sa_csv):
            sa_iphones = import_sa_prices(sa_csv)
        else:
            print(f"  ⚠️  SA file not found: {sa_csv}")

        # Import from KT
        kt_iphones = []
        kt_samsung = []
        if os.path.exists(kt_excel):
            kt_iphones = import_kt_iphones(kt_excel)
            kt_samsung = import_kt_samsung(kt_excel)
        else:
            print(f"  ⚠️  KT file not found: {kt_excel}")

        # Merge iPhone prices (best of both vendors)
        merged_iphones = merge_prices(sa_iphones, kt_iphones)

        # Save separate files for each category
        timestamp = datetime.now().isoformat()

        # Save merged iPhone prices
        iphone_output = {
            'last_updated': timestamp,
            'sources': ['SA', 'KT Corp'],
            'devices': merged_iphones
        }

        with open('/Users/j3r/ReFit/data/pricing-iphones.json', 'w') as f:
            json.dump(iphone_output, f, indent=2)
        print(f"\n💾 Saved iPhone prices: /data/pricing-iphones.json")

        # Save Samsung prices
        samsung_output = {
            'last_updated': timestamp,
            'source': 'KT Corp',
            'devices': kt_samsung
        }

        with open('/Users/j3r/ReFit/data/pricing-samsung.json', 'w') as f:
            json.dump(samsung_output, f, indent=2)
        print(f"💾 Saved Samsung prices: /data/pricing-samsung.json")

        # Show summary
        print("\n" + "="*60)
        print("IMPORT SUMMARY")
        print("="*60)
        print(f"📱 iPhones: {len(merged_iphones)} configurations")
        print(f"🤖 Samsung: {len(kt_samsung)} configurations")

        # Show sample prices
        print("\n📊 Sample Prices (Grade B):")

        # iPhone sample
        for device in merged_iphones:
            if 'iPhone 17 Pro Max' in device['model'] and device['storage'] == '256GB' and device['lock_status'] == 'Unlocked':
                print(f"\niPhone 17 Pro Max 256GB Unlocked:")
                print(f"  Grade B: ${device['prices'].get('B', 'N/A')}")
                if 'vendors' in device:
                    for vendor, prices in device['vendors'].items():
                        print(f"    {vendor}: ${prices.get('B', 'N/A')}")
                break

        # Samsung sample
        for device in kt_samsung:
            if 'S25 ULTRA' in device['model'] and '256GB' in device['storage'] and device['lock_status'] == 'Unlocked':
                print(f"\nGalaxy S25 Ultra 256GB Unlocked:")
                print(f"  Grade B: ${device['prices'].get('B', 'N/A')}")
                break

        print("\n✅ Import complete! Run this script weekly to update prices.")
        return 0

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    exit(main())