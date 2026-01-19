#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
脚本用于将 set_o.json 和 card_all.json 关联
匹配规则：
1. 首先匹配 name (set_o.json) 和 cnName (card_all.json)
2. 如果没有匹配上，匹配 name (set_o.json) 和 enName (card_all.json)
3. 都没有匹配上的话，no 字段保留为空字符串
"""

import json
import os

def match_cards():
    # 读取文件路径
    script_dir = os.path.dirname(os.path.abspath(__file__))
    set_o_path = os.path.join(script_dir, 'set_o.json')
    card_all_path = os.path.join(script_dir, 'card_all.json')

    # 读取 set_o.json
    with open(set_o_path, 'r', encoding='utf-8') as f:
        set_o_data = json.load(f)

    # 读取 card_all.json
    with open(card_all_path, 'r', encoding='utf-8') as f:
        card_all_data = json.load(f)

    # 创建索引：先按 cnName 索引，再按 enName 索引
    cn_name_map = {}
    en_name_map = {}

    for card in card_all_data:
        no = card.get('no', '')
        cn_name = card.get('cnName', '').strip()
        en_name = card.get('enName', '').strip()

        if cn_name:
            cn_name_map[cn_name] = no
        if en_name:
            en_name_map[en_name] = no

    # 为 set_o.json 中的每个条目添加 no 字段
    matched_count = 0
    unmatched_names = []

    for item in set_o_data:
        name = item.get('name', '').strip()
        matched = False

        # 首先尝试匹配 cnName
        if name in cn_name_map:
            item['no'] = cn_name_map[name]
            matched = True
            matched_count += 1
        # 如果没有匹配上，尝试匹配 enName
        elif name in en_name_map:
            item['no'] = en_name_map[name]
            matched = True
            matched_count += 1
        else:
            item['no'] = ''
            unmatched_names.append(name)

    # 重写 set_o.json
    with open(set_o_path, 'w', encoding='utf-8') as f:
        json.dump(set_o_data, f, ensure_ascii=False, indent=4)

    # 输出统计信息
    print(f"处理完成！")
    print(f"总共处理 {len(set_o_data)} 条记录")
    print(f"成功匹配 {matched_count} 条")
    print(f"未匹配 {len(unmatched_names)} 条")

    if unmatched_names:
        print("\n未匹配的卡片名称：")
        for name in unmatched_names:
            print(f"  - {name}")

if __name__ == '__main__':
    match_cards()
