#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate index.csv from multiple data sources
"""

import csv
import json
from collections import defaultdict

def read_csv_file(filepath):
    """Read CSV file and return list of dictionaries"""
    data = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append(row)
    return data

def read_json_file(filepath):
    """Read JSON file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def create_no(deck, number):
    """Create no from Deck and Number columns
    Number needs to be padded to 3 digits (e.g., 1 -> 001)
    """
    if not number:
        return ""

    # Pad number to 3 digits
    number_str = number.strip()
    try:
        number_padded = f"{int(number_str):03d}"
    except ValueError:
        # If number is not a valid integer, use as is
        number_padded = number_str

    if deck and deck.strip():
        return f"{deck.strip()}{number_padded}"
    else:
        return number_padded

def step1_create_pk():
    """Step 1: Create pk.json from CSV files"""
    print("Step 1: Creating pk.json from CSV files...")

    # Read both CSV files
    data1 = read_csv_file('Agricola Database - Database.csv')
    data2 = read_csv_file('Agricola Database - Database (in progress).csv')

    pk_data = []
    seen = set()

    # Process first CSV
    for row in data1:
        deck = row.get('Deck', '').strip()
        number = row.get('Number', '').strip()
        name = row.get('Name', '').strip()

        if not number or not name:
            continue

        # Remove rows where Deck is not in ABCDE or Deck is empty
        if not deck or deck not in ['A', 'B', 'C', 'D', 'E']:
            continue

        no = create_no(deck, number)
        if no and no not in seen:
            pk_data.append({
                'no': no,
                'enName': name,
                'effect': row.get('Text', '').strip()
            })
            seen.add(no)

    # Process second CSV
    for row in data2:
        deck = row.get('Deck', '').strip()
        number = row.get('Number', '').strip()
        name = row.get('Name', '').strip()

        if not number or not name:
            continue

        # Remove rows where Deck is not in ABCDE or Deck is empty
        if not deck or deck not in ['A', 'B', 'C', 'D', 'E']:
            continue

        no = create_no(deck, number)
        if no and no not in seen:
            pk_data.append({
                'no': no,
                'enName': name,
                'effect': row.get('Text', '').strip()
            })
            seen.add(no)

    # Save pk.json
    with open('pk.json', 'w', encoding='utf-8') as f:
        json.dump(pk_data, f, ensure_ascii=False, indent=2)

    print(f"Created pk.json with {len(pk_data)} entries")
    return pk_data

def step2_match_cards_json(pk_data):
    """Step 2: Match cards.json"""
    print("Step 2: Matching cards.json...")

    cards_data = read_json_file('cards.json')

    # Create mapping from no to card data
    cards_map = {}
    for card in cards_data:
        no = card.get('no', '').strip()
        if no:
            cards_map[no] = {
                'cnName': card.get('name', ''),
                'baituTier': card.get('tier', ''),
                'baituDesc': card.get('desc', '')
            }

    # Match with pk_data
    for item in pk_data:
        no = item['no']
        if no in cards_map:
            item.update(cards_map[no])

    print(f"Matched {len([x for x in pk_data if 'cnName' in x])} entries from cards.json")
    return pk_data

def step3_match_e_csv(pk_data):
    """Step 3: Match e.csv"""
    print("Step 3: Matching e.csv...")

    e_data = read_csv_file('e.csv')

    # Create mapping from no to name
    e_map = {}
    for row in e_data:
        no = row.get('no', '').strip()
        name = row.get('name', '').strip()
        if no and name:
            e_map[no] = name

    # Match with pk_data (e.csv might override or supplement cnName)
    matched_count = 0
    for item in pk_data:
        no = item['no']
        if no in e_map:
            item['cnName'] = e_map[no]
            matched_count += 1

    print(f"Matched {matched_count} entries from e.csv")
    return pk_data

def step4_match_en_json(pk_data):
    """Step 4: Match en.json"""
    print("Step 4: Matching en.json...")

    en_data = read_json_file('en.json')

    # Create mapping from card_title to en data
    en_map = {}
    for item in en_data:
        card_title = item.get('card_title', '').strip()
        if card_title:
            en_map[card_title] = {
                'enDesc': item.get('insight', ''),
                'enTier': str(item.get('rating', '')) if item.get('rating') else ''
            }

    # Match with pk_data by enName
    matched_count = 0
    for item in pk_data:
        en_name = item.get('enName', '').strip()
        if en_name and en_name in en_map:
            item.update(en_map[en_name])
            matched_count += 1

    print(f"Matched {matched_count} entries from en.json")
    return pk_data

def generate_index_csv(pk_data):
    """Generate index_raw.csv and filtered index.csv"""
    print("Step 5: Generating index_raw.csv...")

    # Define columns
    columns = ['no', 'cnName', 'enName', 'baituTier', 'enTier', 'chenTier', 'effect', 'baituDesc', 'enDesc', 'chenDesc']

    # First, generate index_raw.csv with all data
    all_rows = []
    with open('index_raw.csv', 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()

        for item in pk_data:
            row = {
                'no': item.get('no', ''),
                'cnName': item.get('cnName', ''),
                'enName': item.get('enName', ''),
                'baituTier': item.get('baituTier', ''),
                'enTier': item.get('enTier', ''),
                'chenTier': '',  # Not found in any source
                'effect': item.get('effect', ''),
                'baituDesc': item.get('baituDesc', ''),
                'enDesc': item.get('enDesc', ''),
                'chenDesc': ''  # Not found in any source
            }
            all_rows.append(row)
            writer.writerow(row)

    print(f"Generated index_raw.csv with {len(all_rows)} rows")

    # Filter rows: remove rows where all tier and desc fields are empty
    print("Step 6: Filtering index.csv...")
    filtered_rows = []
    for row in all_rows:
        # Check if all tier and desc fields are empty
        tier_fields = [row.get('baituTier', '').strip(),
                      row.get('enTier', '').strip(),
                      row.get('chenTier', '').strip()]
        desc_fields = [row.get('baituDesc', '').strip(),
                      row.get('enDesc', '').strip(),
                      row.get('chenDesc', '').strip()]

        # Keep row if at least one tier or desc field is not empty
        if any(tier_fields) or any(desc_fields):
            filtered_rows.append(row)

    # Generate final index.csv
    with open('index.csv', 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        writer.writerows(filtered_rows)

    print(f"Generated index.csv with {len(filtered_rows)} rows (removed {len(all_rows) - len(filtered_rows)} empty rows)")

    return filtered_rows

def step7_generate_card_all_json():
    """Step 7: Generate card_all.json from index.csv"""
    print("Step 7: Generating card_all.json from index.csv...")

    cards = []
    with open('index.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cards.append({
                'no': row.get('no', ''),
                'cnName': row.get('cnName', ''),
                'enName': row.get('enName', ''),
                'baituTier': row.get('baituTier', ''),
                'enTier': row.get('enTier', ''),
                'chenTier': row.get('chenTier', ''),
                'effect': row.get('effect', ''),
                'baituDesc': row.get('baituDesc', ''),
                'enDesc': row.get('enDesc', ''),
                'chenDesc': row.get('chenDesc', '')
            })

    with open('card_all.json', 'w', encoding='utf-8') as f:
        json.dump(cards, f, ensure_ascii=False, indent=2)

    print(f"Generated card_all.json with {len(cards)} entries")

def step8_generate_index_missing():
    """Step 8: Generate index_missing.csv with rows where cnName is empty"""
    print("Step 8: Generating index_missing.csv...")

    missing_rows = []
    columns = ['no', 'cnName', 'enName', 'baituTier', 'enTier', 'chenTier', 'effect', 'baituDesc', 'enDesc', 'chenDesc']

    with open('index.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cn_name = row.get('cnName', '').strip()
            if not cn_name:
                missing_rows.append(row)

    with open('index_missing.csv', 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        writer.writerows(missing_rows)

    print(f"Generated index_missing.csv with {len(missing_rows)} rows (cnName is empty)")

def main():
    # Step 1: Create pk.json
    pk_data = step1_create_pk()

    # Step 2: Match cards.json
    pk_data = step2_match_cards_json(pk_data)

    # Step 3: Match e.csv
    pk_data = step3_match_e_csv(pk_data)

    # Step 4: Match en.json
    pk_data = step4_match_en_json(pk_data)

    # Step 5: Generate index_raw.csv and filtered index.csv
    generate_index_csv(pk_data)

    # Step 7: Generate card_all.json from index.csv
    step7_generate_card_all_json()

    # Step 8: Generate index_missing.csv with rows where cnName is empty
    step8_generate_index_missing()

    print("\nDone! Generated index_raw.csv, index.csv, card_all.json, and index_missing.csv")

if __name__ == '__main__':
    main()

