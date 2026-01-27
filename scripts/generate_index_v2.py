#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate card_all_v2.json from multiple data sources with ICardV2 structure
"""

import csv
import json
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(__file__))
from generate_index import *

def convert_en_tier_to_score(tier):
    """Convert EN tier letter to score: A->5, B->4, C->3, D->2, E->1, F/empty->0"""
    tier_map = {'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0}
    return tier_map.get(tier.strip(), 0) if tier else 0

def convert_jp_score_to_tier(score):
    """Convert jpwiki score (0-10) to tier: 9-10->A, 7-8->B, 5-6->C, 3-4->D, 1-2->E, 0->F"""
    try:
        score_val = float(score)
        if score_val >= 9: return 'A'
        elif score_val >= 7: return 'B'
        elif score_val >= 5: return 'C'
        elif score_val >= 3: return 'D'
        elif score_val >= 1: return 'E'
        else: return 'F'
    except (ValueError, TypeError):
        return ''



def convert_to_v2_structure(card_v1):
    """Convert V1 card structure to V2 structure"""
    locale_names = {
        'en': card_v1.get('enName', '') or '',
        'zh': card_v1.get('cnName', '') or ''
    }
    if card_v1.get('jpName'):
        locale_names['jp'] = card_v1.get('jpName', '')

    locale_descs = {}
    effect = card_v1.get('effect', '') or card_v1.get('desc', '') or ''
    if effect:
        locale_descs['en'] = effect
        # locale_descs['zh'] = effect

    tiers = []

    baitu_tier = card_v1.get('baituTier', '').strip()
    baitu_desc = card_v1.get('baituDesc', '').strip()
    if baitu_tier or baitu_desc:
        locale_descs_baitu = {}
        if baitu_desc:
            locale_descs_baitu['zh'] = baitu_desc
        tiers.append({
            'author': 'baitu',
            'tier': baitu_tier,
            'score': None,
            'desc': baitu_desc,
            'localeDescs': locale_descs_baitu
        })

    en_tier = card_v1.get('enTier', '').strip()
    en_desc = card_v1.get('enDesc', '').strip()
    en_desc_trans2zh = card_v1.get('enDesc_trans2zh', '').strip()
    if en_tier or en_desc:
        en_score = convert_en_tier_to_score(en_tier)
        locale_descs_en = {}
        if en_desc:
            locale_descs_en['en'] = en_desc
            locale_descs_en['zh'] = en_desc_trans2zh if en_desc_trans2zh else en_desc
        tiers.append({
            'author': 'mark',
            'tier': en_tier,
            'score': en_score if en_score > 0 else None,
            'desc': en_desc,
            'localeDescs': locale_descs_en
        })

    chen_tier = card_v1.get('chenTier', '').strip()
    chen_desc = card_v1.get('chenDesc', '').strip()
    if chen_tier or chen_desc:
        locale_descs_chen = {}
        if chen_desc:
            locale_descs_chen['zh'] = chen_desc
        tiers.append({
            'author': 'chen',
            'tier': chen_tier,
            'score': None,
            'desc': chen_desc,
            'localeDescs': locale_descs_chen
        })

    jpwiki_score = card_v1.get('jpwiki_score', '').strip()
    comment_jpwiki_cn = card_v1.get('comment_jpwiki_cn', '').strip()
    if jpwiki_score or comment_jpwiki_cn:
        jp_tier = convert_jp_score_to_tier(jpwiki_score) if jpwiki_score else ''
        try:
            jp_score_val = float(jpwiki_score) if jpwiki_score else None
        except (ValueError, TypeError):
            jp_score_val = None

        locale_descs_jpwiki = {}
        if comment_jpwiki_cn:
            locale_descs_jpwiki['zh'] = comment_jpwiki_cn
        tiers.append({
            'author': 'jpwiki',
            # 'tier': jp_tier,
            'tier': '', # remove jp tier

            'score': jp_score_val,
            'desc': comment_jpwiki_cn,
            'localeDescs': locale_descs_jpwiki
        })

    card_v2 = {
        'no': card_v1.get('no', ''),
        'localeNames': locale_names,
        'localeDescs': locale_descs,
        'tiers': tiers
    }

    if 'stats' in card_v1 and card_v1['stats']:
        card_v2['stats'] = card_v1['stats']

    return card_v2

def generate_card_all_v2_json(stats_data):
    """Generate card_all_v2.json from index.csv with statistics using V2 structure"""
    print("Step: Generating card_all_v2.json from index.csv (V2 structure)...")

    # Load cards_export.json for merging enDesc_trans2zh and jpwiki_score
    cards_export_map = {}
    try:
        cards_export_data = read_json_file('cards_export.json')
        for item in cards_export_data:
            card_id = item.get('id', '').strip()
            if card_id:
                cards_export_map[card_id] = {
                    'enDesc_trans2zh': item.get('enDesc_trans2zh', ''),
                    'jpwiki_score': item.get('jpwiki_score', '')
                }
        print(f"Loaded {len(cards_export_map)} entries from cards_export.json")
    except FileNotFoundError:
        print("Warning: cards_export.json not found, skipping merge")
    except Exception as e:
        print(f"Warning: Error loading cards_export.json: {e}, skipping merge")

    cards = []

    with open('index.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            card_v1 = {
                'no': row.get('no', ''),
                'cnName': row.get('cnName', ''),
                'enName': row.get('enName', ''),
                'desc': row.get('effect', ''),
                'baituTier': row.get('baituTier', ''),
                'enTier': row.get('enTier', ''),
                'chenTier': row.get('chenTier', ''),
                'jpName': row.get('jpName', ''),
                'baituDesc': row.get('baituDesc', ''),
                'enDesc': row.get('enDesc', ''),
                'enDesc_trans2zh': row.get('enDesc_trans2zh', ''),
                'chenDesc': row.get('chenDesc', ''),
                'jpwiki_score': row.get('jpwiki_score', ''),
                'comment_jpwiki_cn': row.get('comment_jpwiki_cn', '')
            }

            en_name = row.get('enName', '').strip()
            stats = {}
            if en_name:
                if en_name in stats_data['default']:
                    stats['default'] = stats_data['default'][en_name]
                if en_name in stats_data['nb']:
                    stats['nb'] = stats_data['nb'][en_name]

            if stats:
                card_v1['stats'] = stats

            # Merge cards_export.json data
            no = row.get('no', '').strip()
            if no and no in cards_export_map:
                card_v1['enDesc_trans2zh'] = cards_export_map[no]['enDesc_trans2zh']
                card_v1['jpwiki_score'] = cards_export_map[no]['jpwiki_score']

            card_v2 = convert_to_v2_structure(card_v1)
            cards.append(card_v2)

    with open('card_all_v2.json', 'w', encoding='utf-8') as f:
        json.dump(cards, f, ensure_ascii=False, indent=2)

    print(f"Generated card_all_v2.json with {len(cards)} entries")
    return cards

def sync_card_all_v2_json():
    """Sync card_all_v2.json to plugin-v2 and web directories"""
    print("Step: Syncing card_all_v2.json to target directories...")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    source_file = os.path.join(script_dir, 'card_all_v2.json')

    targets = [
        os.path.join(project_root, 'plugin-v2', 'assets', 'cards.json'),
        os.path.join(project_root, 'web', 'public', 'cards.json')
    ]

    if not os.path.exists(source_file):
        print(f"Error: Source file {source_file} does not exist!")
        return

    copied_count = 0
    for target in targets:
        try:
            target_dir = os.path.dirname(target)
            os.makedirs(target_dir, exist_ok=True)
            shutil.copy2(source_file, target)
            copied_count += 1
            print(f"  Copied to: {target}")
        except Exception as e:
            print(f"  Error copying to {target}: {e}")

    print(f"Successfully synced card_all_v2.json to {copied_count}/{len(targets)} locations")

def main():
    print("=== Generating Card Data (V2 Structure) ===\n")

    pk_data = step1_create_pk()
    pk_data = step2_match_cards_json(pk_data)
    pk_data = step3_match_e_csv(pk_data)
    pk_data = step4_match_en_json(pk_data)
    pk_data, even_more_set_items = step4_5_match_even_more_set(pk_data)
    pk_data = step5_match_jp_jsonl(pk_data)
    stats_data = step8_load_statistics()
    generate_index_csv(pk_data, even_more_set_items, stats_data)
    step7_match_set_o_json()
    generate_card_all_v2_json(stats_data)
    step10_generate_index_missing()
    sync_card_all_v2_json()

    print("\n=== Done! Generated ===")
    print("- index_raw.csv")
    print("- index.csv")
    print("- index_missing.csv")
    print("- card_all_v2.json (V2 structure)")
    print("- Synced cards.json to plugin-v2 and web directories")

if __name__ == '__main__':
    main()
