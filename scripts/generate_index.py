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

def convert_rating_to_tier(rating):
    """Convert rating number to tier letter
    1 -> E, 2 -> D, 3 -> C, 4 -> B, 5 -> A, 0 or other -> empty string
    """
    rating_map = {
        1: 'E',
        2: 'D',
        3: 'C',
        4: 'B',
        5: 'A'
    }

    try:
        rating_int = int(rating)
        if rating_int == 0:
            return ''
        return rating_map.get(rating_int, '')
    except (ValueError, TypeError):
        return ''

def step4_match_en_json(pk_data):
    """Step 4: Match en.json"""
    print("Step 4: Matching en.json...")

    en_data = read_json_file('en.json')

    # Create mapping from card_title to en data
    en_map = {}
    for item in en_data:
        card_title = item.get('card_title', '').strip()
        if card_title:
            rating = item.get('rating', 0)
            en_map[card_title] = {
                'enDesc': item.get('insight', ''),
                'enTier': convert_rating_to_tier(rating)
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

def step4_5_match_even_more_set(pk_data):
    """Step 4.5: Match even_more_set_minor_improvements.json
    First try to match by no, if not found, match by name to cnName
    """
    print("Step 4.5: Matching even_more_set_minor_improvements.json...")

    even_more_data = read_json_file('even_more_set_minor_improvements.json')

    # Track which items have even_more_set data
    even_more_set_items = set()

    # First pass: match by no
    no_map = {}
    for item in even_more_data:
        no = item.get('no', '').strip()
        if no:
            # Store the data, keyed by no
            no_map[no] = {
                'name': item.get('name', '').strip(),
                'chenTier': item.get('tier', '').strip(),
                'chenDesc': item.get('desc', '').strip()
            }

    matched_by_no = 0
    cn_name_set_count = 0
    for pk_item in pk_data:
        no = pk_item.get('no', '').strip()
        if no and no in no_map:
            # Update chenTier and chenDesc (may override existing values)
            pk_item['chenTier'] = no_map[no]['chenTier']
            pk_item['chenDesc'] = no_map[no]['chenDesc']

            # If current entry has no cnName, use the name from even_more_set
            if not pk_item.get('cnName', '').strip():
                pk_item['cnName'] = no_map[no]['name']
                cn_name_set_count += 1

            even_more_set_items.add(no)
            matched_by_no += 1

    # Second pass: match by name to cnName (for items not matched by no)
    name_map = {}
    for item in even_more_data:
        name = item.get('name', '').strip()
        no = item.get('no', '').strip()
        # Only add to name_map if this item wasn't matched by no
        if name and (not no or no not in even_more_set_items):
            name_map[name] = {
                'chenTier': item.get('tier', '').strip(),
                'chenDesc': item.get('desc', '').strip()
            }

    matched_by_name = 0
    for pk_item in pk_data:
        no = pk_item.get('no', '').strip()
        # Only try name matching if not already matched by no
        if no not in even_more_set_items:
            cn_name = pk_item.get('cnName', '').strip()
            if cn_name and cn_name in name_map:
                # Update chenTier and chenDesc
                pk_item['chenTier'] = name_map[cn_name]['chenTier']
                pk_item['chenDesc'] = name_map[cn_name]['chenDesc']
                even_more_set_items.add(no)
                matched_by_name += 1

    print(f"Matched {matched_by_no} entries by no, {matched_by_name} entries by name from even_more_set_minor_improvements.json")
    if cn_name_set_count > 0:
        print(f"  Set cnName for {cn_name_set_count} entries that had no cnName")

    return pk_data, even_more_set_items

def generate_index_csv(pk_data, even_more_set_items=None, stats_data=None):
    """Generate index_raw.csv and filtered index.csv
    Args:
        pk_data: List of card data
        even_more_set_items: Set of 'no' values that have even_more_set data
        stats_data: Dictionary with statistics data (for checking 4p_de matches)
    """
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
                'chenTier': item.get('chenTier', ''),  # From even_more_set_minor_improvements.json or set_o.json
                'effect': item.get('effect', ''),
                'baituDesc': item.get('baituDesc', ''),
                'enDesc': item.get('enDesc', ''),
                'chenDesc': item.get('chenDesc', '')  # From even_more_set_minor_improvements.json or set_o.json
            }
            all_rows.append(row)
            writer.writerow(row)

    print(f"Generated index_raw.csv with {len(all_rows)} rows")

    # Filter rows: remove rows where all tier and desc fields are empty
    # BUT keep rows if they have even_more_set data or match 4p_de.tsv
    print("Step 6: Filtering index.csv...")
    filtered_rows = []

    # Create a set of enNames that match 4p_de.tsv
    matched_4p_de = set()
    if stats_data and 'default' in stats_data:
        matched_4p_de = set(stats_data['default'].keys())

    for row in all_rows:
        # Check if all tier and desc fields are empty
        tier_fields = [row.get('baituTier', '').strip(),
                      row.get('enTier', '').strip(),
                      row.get('chenTier', '').strip()]
        desc_fields = [row.get('baituDesc', '').strip(),
                      row.get('enDesc', '').strip(),
                      row.get('chenDesc', '').strip()]

        # Check if row has even_more_set data
        no = row.get('no', '').strip()
        has_even_more_set = even_more_set_items and no in even_more_set_items

        # Check if row matches 4p_de.tsv
        en_name = row.get('enName', '').strip()
        matches_4p_de = en_name in matched_4p_de

        # Keep row if:
        # 1. At least one tier or desc field is not empty, OR
        # 2. Has even_more_set data, OR
        # 3. Matches 4p_de.tsv
        if any(tier_fields) or any(desc_fields) or has_even_more_set or matches_4p_de:
            filtered_rows.append(row)

    # Generate final index.csv
    with open('index.csv', 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        writer.writerows(filtered_rows)

    print(f"Generated index.csv with {len(filtered_rows)} rows (removed {len(all_rows) - len(filtered_rows)} empty rows)")

    return filtered_rows

def step7_match_set_o_json():
    """Step 7: Match set_o.json and update chenTier and chenDesc in index.csv"""
    print("Step 7: Matching set_o.json...")

    # Read set_o.json
    set_o_data = read_json_file('set_o.json')

    # Create mapping from name to tier and desc
    set_o_map = {}
    for item in set_o_data:
        name = item.get('name', '').strip()
        if name:
            set_o_map[name] = {
                'chenTier': item.get('tier', '').strip(),
                'chenDesc': item.get('desc', '').strip()
            }

    # Read index.csv and update rows
    columns = ['no', 'cnName', 'enName', 'baituTier', 'enTier', 'chenTier', 'effect', 'baituDesc', 'enDesc', 'chenDesc']
    updated_rows = []
    matched_count = 0

    with open('index.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cn_name = row.get('cnName', '').strip()
            if cn_name and cn_name in set_o_map:
                # Update chenTier and chenDesc
                row['chenTier'] = set_o_map[cn_name]['chenTier']
                row['chenDesc'] = set_o_map[cn_name]['chenDesc']
                matched_count += 1
            updated_rows.append(row)

    # Write updated index.csv
    with open('index.csv', 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        writer.writerows(updated_rows)

    print(f"Matched {matched_count} entries from set_o.json and updated index.csv")

def parse_tsv_stats(filepath):
    """Parse TSV file and extract statistics (pwr, adp, drawPlayRate)
    Returns a dictionary mapping Card Name to stats
    """
    stats_map = {}

    with open(filepath, 'r', encoding='utf-8') as f:
        # TSV files use tab separator
        reader = csv.DictReader(f, delimiter='\t')

        # Find the actual column names (they may have leading/trailing spaces)
        fieldnames = reader.fieldnames
        card_name_col = None
        pwr_col = None
        adp_col = None
        apr_col = None
        plays_col = None
        drafted_col = None

        for col in fieldnames:
            col_stripped = col.strip()
            if 'Card Name' in col_stripped or col_stripped == 'Card Name':
                card_name_col = col
            elif col_stripped == 'PWR':
                pwr_col = col
            elif col_stripped == 'ADP':
                adp_col = col
            elif col_stripped == 'APR':
                apr_col = col
            elif col_stripped == 'Plays':
                plays_col = col
            elif col_stripped == 'Drafted':
                drafted_col = col

        if not card_name_col:
            print(f"Warning: Could not find 'Card Name' column in {filepath}")
            return stats_map

        for row in reader:
            card_name = row.get(card_name_col, '').strip()
            if not card_name:
                continue

            # Extract PWR and ADP
            try:
                pwr_val = row.get(pwr_col, '') if pwr_col else ''
                pwr = float(pwr_val.strip()) if pwr_val and pwr_val.strip() else None
            except (ValueError, TypeError):
                pwr = None

            try:
                adp_val = row.get(adp_col, '') if adp_col else ''
                adp = float(adp_val.strip()) if adp_val and adp_val.strip() else None
            except (ValueError, TypeError):
                adp = None

            try:
                apr_val = row.get(apr_col, '') if apr_col else ''
                apr = float(apr_val.strip()) if apr_val and apr_val.strip() else None
            except (ValueError, TypeError):
                apr = None

            # Calculate drawPlayRate = Plays / Drafted
            try:
                plays_val = row.get(plays_col, '') if plays_col else ''
                drafted_val = row.get(drafted_col, '') if drafted_col else ''
                plays = float(plays_val.strip()) if plays_val and plays_val.strip() else 0
                drafted = float(drafted_val.strip()) if drafted_val and drafted_val.strip() else 0
                draw_play_rate = plays / drafted if drafted > 0 else None
            except (ValueError, TypeError, ZeroDivisionError):
                draw_play_rate = None

            stats_map[card_name] = {
                'pwr': pwr,
                'adp': adp,
                'apr': apr,
                'drawPlayRate': draw_play_rate
            }

    return stats_map

def step8_load_statistics():
    """Step 8: Load statistics from TSV files"""
    print("Step 8: Loading statistics from TSV files...")

    # Parse both TSV files
    de_stats = parse_tsv_stats('4p_de.tsv')
    nb_stats = parse_tsv_stats('4p_nb.tsv')

    print(f"Loaded {len(de_stats)} entries from 4p_de.tsv")
    print(f"Loaded {len(nb_stats)} entries from 4p_nb.tsv")

    return {
        'default': de_stats,  # 4p_de corresponds to default
        'nb': nb_stats        # 4p_nb corresponds to nb
    }

def step9_generate_card_all_json(stats_data):
    """Step 9: Generate card_all.json from index.csv with statistics"""
    print("Step 9: Generating card_all.json from index.csv...")

    cards = []
    matched_default = 0
    matched_nb = 0

    with open('index.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            card = {
                'no': row.get('no', ''),
                'cnName': row.get('cnName', ''),
                'enName': row.get('enName', ''),
                'baituTier': row.get('baituTier', ''),
                'enTier': row.get('enTier', ''),
                'chenTier': row.get('chenTier', ''),
                'baituDesc': row.get('baituDesc', ''),
                'enDesc': row.get('enDesc', ''),
                'chenDesc': row.get('chenDesc', '')
            }

            # Match statistics by enName
            en_name = row.get('enName', '').strip()
            stats = {}

            if en_name:
                # Match default stats (from 4p_de)
                if en_name in stats_data['default']:
                    stats['default'] = stats_data['default'][en_name]
                    matched_default += 1

                # Match nb stats (from 4p_nb)
                if en_name in stats_data['nb']:
                    stats['nb'] = stats_data['nb'][en_name]
                    matched_nb += 1

            # Only add stats if we have at least one match
            if stats:
                card['stats'] = stats

            cards.append(card)

    with open('card_all.json', 'w', encoding='utf-8') as f:
        json.dump(cards, f, ensure_ascii=False, indent=2)

    print(f"Generated card_all.json with {len(cards)} entries")
    print(f"Matched {matched_default} entries with default stats (4p_de)")
    print(f"Matched {matched_nb} entries with nb stats (4p_nb)")

def step10_generate_index_missing():
    """Step 10: Generate index_missing.csv with rows where cnName is empty"""
    print("Step 10: Generating index_missing.csv...")

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

    # Step 4.5: Match even_more_set_minor_improvements.json
    pk_data, even_more_set_items = step4_5_match_even_more_set(pk_data)

    # Step 8: Load statistics from TSV files (needed before filtering)
    stats_data = step8_load_statistics()

    # Step 5: Generate index_raw.csv and filtered index.csv
    # Pass even_more_set_items and stats_data for filtering logic
    generate_index_csv(pk_data, even_more_set_items, stats_data)

    # Step 7: Match set_o.json and update index.csv
    step7_match_set_o_json()

    # Step 9: Generate card_all.json from index.csv with statistics
    step9_generate_card_all_json(stats_data)

    # Step 10: Generate index_missing.csv with rows where cnName is empty
    step10_generate_index_missing()

    print("\nDone! Generated index_raw.csv, index.csv, card_all.json, and index_missing.csv")

if __name__ == '__main__':
    main()

