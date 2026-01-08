#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
更新 cards.json，使其与卡牌.xlsx 匹配
- 如果能关联上 no，使用卡牌.xlsx 里面的 cnName 作为中文名
- 如果关联不上或者本身没有 no，用 name 关联 enName，并取 no 作为 json 的 no
"""

import json
import pandas as pd
from pathlib import Path

def main():
    # 文件路径
    script_dir = Path(__file__).parent
    excel_path = script_dir / '卡牌.xlsx'
    json_path = script_dir / 'cards.json'

    # 读取 Excel 文件
    print(f"正在读取 Excel 文件: {excel_path}")
    df = pd.read_excel(excel_path)

    # 创建映射字典
    # no -> cnName 映射
    no_to_cnname = {}
    # cnName -> (no, cnName) 映射（用于通过中文名匹配）
    cnname_to_info = {}
    # enName -> (no, cnName) 映射（备用，用于通过英文名匹配）
    enname_to_info = {}

    for _, row in df.iterrows():
        no = str(row['no']).strip() if pd.notna(row['no']) else None
        cn_name = str(row['cnName']).strip() if pd.notna(row['cnName']) else None
        en_name = str(row['enName']).strip() if pd.notna(row['enName']) else None

        if no and cn_name:
            no_to_cnname[no] = cn_name

        if cn_name:
            cnname_to_info[cn_name] = {
                'no': no,
                'cnName': cn_name
            }

        if en_name:
            enname_to_info[en_name] = {
                'no': no,
                'cnName': cn_name
            }

    print(f"Excel 文件包含 {len(no_to_cnname)} 个 no 映射，{len(cnname_to_info)} 个 cnName 映射，{len(enname_to_info)} 个 enName 映射")

    # 读取 JSON 文件
    print(f"正在读取 JSON 文件: {json_path}")
    with open(json_path, 'r', encoding='utf-8') as f:
        cards = json.load(f)

    print(f"JSON 文件包含 {len(cards)} 张卡牌")

    # 统计信息
    matched_by_no = 0
    matched_by_name = 0
    no_match = 0
    updated_no = 0

    # 更新每张卡牌
    for card in cards:
        card_no = card.get('no', '').strip() if card.get('no') else None
        card_name = card.get('name', '').strip() if card.get('name') else None

        matched = False

        # 策略1: 如果有 no，尝试用 no 匹配
        if card_no:
            if card_no in no_to_cnname:
                cn_name = no_to_cnname[card_no]
                if card_name != cn_name:
                    card['name'] = cn_name
                    matched_by_no += 1
                    matched = True
                else:
                    matched_by_no += 1
                    matched = True

        # 策略2: 如果匹配不上或者没有 no，用 name（中文名）匹配 cnName
        if not matched and card_name:
            if card_name in cnname_to_info:
                info = cnname_to_info[card_name]
                if info['no']:
                    card['no'] = info['no']
                    updated_no += 1
                if info['cnName']:
                    card['name'] = info['cnName']
                matched_by_name += 1
                matched = True
            # 策略2b: 如果中文名匹配不上，尝试用 name 匹配 enName（备用）
            elif card_name in enname_to_info:
                info = enname_to_info[card_name]
                if info['no']:
                    card['no'] = info['no']
                    updated_no += 1
                if info['cnName']:
                    card['name'] = info['cnName']
                matched_by_name += 1
                matched = True

        if not matched:
            no_match += 1

    # 保存更新后的 JSON
    print(f"\n匹配统计:")
    print(f"  通过 no 匹配: {matched_by_no}")
    print(f"  通过 name 匹配: {matched_by_name}")
    print(f"  未匹配: {no_match}")
    print(f"  更新了 no: {updated_no}")

    print(f"\n正在保存更新后的 JSON 文件...")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(cards, f, ensure_ascii=False, indent=2)

    print("完成！")

if __name__ == '__main__':
    main()

