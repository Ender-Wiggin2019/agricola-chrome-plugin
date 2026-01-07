'''
Author: Oushuo Huang
Date: 2026-01-07 10:03:17
LastEditors: Oushuo Huang
LastEditTime: 2026-01-07 10:03:27
Description:
'''
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SRT to TXT converter
Extracts subtitle text from SRT files and saves as TXT files.
"""

import os
import re
import glob


def srt_to_txt(srt_file_path):
    """
    Convert SRT file to TXT file by extracting subtitle text.

    Args:
        srt_file_path: Path to the SRT file

    Returns:
        Path to the created TXT file
    """
    # Read SRT file
    with open(srt_file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split by double newlines to get individual subtitle blocks
    blocks = content.strip().split('\n\n')

    # Extract text from each block
    texts = []
    for block in blocks:
        lines = block.strip().split('\n')
        if len(lines) >= 3:
            # Skip sequence number (line 0) and timestamp (line 1)
            # Get all text lines (line 2 onwards)
            text_lines = lines[2:]
            text = '\n'.join(text_lines).strip()
            if text:
                texts.append(text)

    # Join all texts with newlines
    txt_content = '\n'.join(texts)

    # Create output file path
    txt_file_path = srt_file_path.replace('.srt', '.txt')

    # Write TXT file
    with open(txt_file_path, 'w', encoding='utf-8') as f:
        f.write(txt_content)

    return txt_file_path


def main():
    """Convert all SRT files in current directory."""
    # Get current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))

    # Find all SRT files
    srt_files = glob.glob(os.path.join(current_dir, '*.srt'))

    if not srt_files:
        print("No SRT files found in current directory.")
        return

    print(f"Found {len(srt_files)} SRT file(s):")
    for srt_file in srt_files:
        print(f"  - {os.path.basename(srt_file)}")

    # Convert each SRT file
    converted = []
    for srt_file in srt_files:
        try:
            txt_file = srt_to_txt(srt_file)
            converted.append((srt_file, txt_file))
            print(f"\n✓ Converted: {os.path.basename(srt_file)} -> {os.path.basename(txt_file)}")
        except Exception as e:
            print(f"\n✗ Error converting {os.path.basename(srt_file)}: {e}")

    print(f"\n\nConversion complete! Converted {len(converted)} file(s).")


if __name__ == '__main__':
    main()

