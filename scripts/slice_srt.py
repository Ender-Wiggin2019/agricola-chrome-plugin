#!/usr/bin/env python3
"""
SRT文件切片工具，每次显示100行
"""
import sys

def slice_srt(filename, start_line=1, chunk_size=100):
    """读取SRT文件并显示指定范围的行"""
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    total_lines = len(lines)
    end_line = min(start_line + chunk_size - 1, total_lines)

    print(f"=== 显示第 {start_line}-{end_line} 行 (共 {total_lines} 行) ===\n")

    for i in range(start_line - 1, end_line):
        print(f"{i+1:5d}: {lines[i]}", end='')

    print(f"\n=== 当前范围: {start_line}-{end_line} / {total_lines} ===")
    print(f"下一个切片: python slice_srt.py {filename} {end_line + 1}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("用法: python slice_srt.py <srt文件> [起始行号] [每批行数]")
        sys.exit(1)

    filename = sys.argv[1]
    start_line = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    chunk_size = int(sys.argv[3]) if len(sys.argv) > 3 else 100

    slice_srt(filename, start_line, chunk_size)

