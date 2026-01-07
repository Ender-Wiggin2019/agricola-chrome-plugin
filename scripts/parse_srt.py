#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
解析SRT文件，提取卡牌讨论段落
"""
import re
import json

def parse_srt_to_segments(srt_file):
    """将SRT文件解析为段落"""
    with open(srt_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 按双换行分割
    blocks = content.strip().split('\n\n')

    segments = []
    current_segment = None

    for block in blocks:
        lines = block.strip().split('\n')
        if len(lines) < 3:
            continue

        seq_num = lines[0]
        time_line = lines[1]
        text = '\n'.join(lines[2:]).strip()

        # 提取时间
        time_match = re.match(r'(\d+):(\d+):(\d+),(\d+)', time_line)
        if time_match:
            hours, minutes, seconds, milliseconds = time_match.groups()
            time_str = f"{hours}:{minutes}:{seconds}"
        else:
            time_str = time_line

        # 检查是否是新的卡牌讨论开始（包含"第X张卡"、"这张卡"等关键词）
        if re.search(r'(第[一二三四五六七八九十\d]+张卡|这张卡|接着|然后)', text):
            if current_segment:
                segments.append(current_segment)
            current_segment = {
                'start_time': time_str,
                'start_seq': seq_num,
                'texts': [text]
            }
        elif current_segment:
            current_segment['texts'].append(text)
            current_segment['end_time'] = time_str
            current_segment['end_seq'] = seq_num

    if current_segment:
        segments.append(current_segment)

    return segments

def extract_card_info(segments):
    """从段落中提取卡牌信息（需要人工整理）"""
    cards = []

    for seg in segments:
        full_text = ' '.join(seg['texts'])

        # 尝试提取卡牌名称（简单模式）
        name_patterns = [
            r'([^，。\s]+(?:导师|馆长|泥浆|管家|床|偷懒|学徒|寄宿者|士官|邋遢|夜班|宣传员|多重工|密码|秋木|设计师|研究员|工人|小窝|进口|挖掘|追梦|老板|追猎者|专家|耳尖|耕田者|读书人|丈夫|收集者|继承|农民|说书人|收税人|护甲|大师|棍|收费员|距离))',
            r'([^，。\s]+(?:者|人|师|员|工|家|客|商|主|士))',
        ]

        card_name = None
        for pattern in name_patterns:
            match = re.search(pattern, full_text)
            if match:
                card_name = match.group(1)
                break

        # 尝试提取评级
        tier_pattern = r'([ABCDEFS])'
        tier_match = re.search(tier_pattern, full_text)
        tier = tier_match.group(1) if tier_match else None

        cards.append({
            'time': seg['start_time'],
            'name': card_name or '未知',
            'tier': tier or '未知',
            'text': full_text[:200] + '...' if len(full_text) > 200 else full_text
        })

    return cards

if __name__ == '__main__':
    srt_file = '待处理文件/even more set 职业_1.srt'
    segments = parse_srt_to_segments(srt_file)

    print(f"找到 {len(segments)} 个段落")

    # 保存段落信息供人工检查
    with open('segments.json', 'w', encoding='utf-8') as f:
        json.dump(segments, f, ensure_ascii=False, indent=2)

    # 尝试提取卡牌信息
    cards = extract_card_info(segments)

    print(f"\n提取到 {len(cards)} 个卡牌信息（需要人工整理）:")
    for i, card in enumerate(cards[:10], 1):  # 只显示前10个
        print(f"{i}. {card['time']} - {card['name']} - {card['tier']}")

