#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
方法1: 使用 Microsoft MarkItDown 将 PDF 转换为 Markdown。
MarkItDown 是微软开源的统一文档转换工具，能够较好地保留文档结构。
"""
import sys
from pathlib import Path
from markitdown import MarkItDown

PDF_PATH = "/Users/lzc/TNTprojectZ/AprojectZ/projectA/idea0704/docs/CANN社区版 8.5.0 Ascend C算子开发指南 01.pdf"
OUT_DIR = Path("/Users/lzc/TNTprojectZ/AprojectZ/projectA/idea0704/pdf2md/output/method1_markitdown")
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT_FILE = OUT_DIR / "CANN_Ascend_C算子开发指南.md"

def main():
    print(f"[method1] 转换: {PDF_PATH}")
    md = MarkItDown()
    result = md.convert(PDF_PATH)
    text = result.text_content or ""
    OUT_FILE.write_text(text, encoding="utf-8")
    print(f"[method1] 完成, 字符数={len(text)}, 输出: {OUT_FILE}")

if __name__ == "__main__":
    main()
