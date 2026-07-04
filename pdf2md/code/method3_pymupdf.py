#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
方法3: 使用 PyMuPDF(fitz) 提取。
特性:
  - 利用 PDF 大纲(bookmarks/TOC) 重建层级目录
  - 使用 "dict" 模式按字号识别标题
  - 提取并保存所有嵌入图片
  - 通过 page.get_text("blocks") 保留代码块/段落
  - 表格用 page.find_tables() 转 markdown
"""
import re
from pathlib import Path
import fitz  # PyMuPDF

PDF_PATH = "/Users/lzc/TNTprojectZ/AprojectZ/projectA/idea0704/docs/CANN社区版 8.5.0 Ascend C算子开发指南 01.pdf"
OUT_DIR = Path("/Users/lzc/TNTprojectZ/AprojectZ/projectA/idea0704/pdf2md/output/method3_pymupdf")
IMG_DIR = OUT_DIR / "images"
IMG_DIR.mkdir(parents=True, exist_ok=True)
OUT_FILE = OUT_DIR / "CANN_Ascend_C算子开发指南.md"

HEADING_RE = re.compile(r"^\d+(\.\d+)*\s")

def heading_level(size):
    if size >= 18:
        return 1
    if size >= 14:
        return 2
    if size >= 11.5:
        return 3
    if size > 10.3:
        return 4
    return 0

def table_to_md(table):
    rows = table.extract() or []
    if not rows:
        return ""
    rows = [[(c or "").replace("\n", " ").strip() for c in row] for row in rows]
    ncols = max(len(r) for r in rows)
    rows = [r + [""] * (ncols - len(r)) for r in rows]
    md = ["| " + " | ".join(rows[0]) + " |",
          "| " + " | ".join(["---"] * ncols) + " |"]
    for r in rows[1:]:
        md.append("| " + " | ".join(r) + " |")
    return "\n".join(md)

def is_code_like(text):
    # 简单启发：含花括号/分号结尾/常见代码关键字 且 中文比例低
    if not text.strip():
        return False
    cn = sum(1 for c in text if '\u4e00' <= c <= '\u9fff')
    ratio = cn / max(len(text), 1)
    clues = (";" in text or "{" in text or "}" in text or "()" in text or "//" in text or "#" in text)
    return ratio < 0.1 and clues and "\n" in text

def extract_images(page, page_no):
    refs = []
    for img_index, img in enumerate(page.get_images(full=True), start=1):
        xref = img[0]
        try:
            base = doc.extract_image(xref)
            ext = base["ext"]
            fname = f"p{page_no:05d}_{img_index}.{ext}"
            (IMG_DIR / fname).write_bytes(base["image"])
            refs.append(f"![图片](images/{fname})")
        except Exception:
            pass
    return refs

def main():
    global doc
    print(f"[method3] 打开: {PDF_PATH}")
    doc = fitz.open(PDF_PATH)
    total = doc.page_count
    print(f"[method3] 总页数: {total}")

    # 1) 大纲(TOC)
    toc = doc.get_toc(simple=True)
    toc_md = []
    if toc:
        toc_md.append("## 目录 (来自 PDF 大纲)\n")
        for lvl, title, pno in toc:
            toc_md.append(f"{'  ' * (lvl-1)}- {title} (p.{pno})")
        toc_md.append("\n---\n")

    parts = ["# CANN社区版 8.5.0 Ascend C 算子开发指南\n",
             "> 由 PyMuPDF(fitz) 自动转换，保留目录、图片、代码块、表格。\n\n"]
    parts.extend(toc_md)

    # 2) 每页内容
    for pno in range(1, total + 1):
        page = doc[pno - 1]
        parts.append(f"\n<!-- page {pno} / {total} -->\n")

        # 文本块(带字号)
        d = page.get_text("dict")
        for block in d.get("blocks", []):
            if block.get("type", 0) != 0:
                continue
            lines_text = []
            sizes = []
            for line in block.get("lines", []):
                spans = line.get("spans", [])
                txt = "".join(s.get("text", "") for s in spans)
                lines_text.append(txt)
                sizes.extend(s.get("size", 0) for s in spans)
            text = "\n".join(lines_text).strip()
            if not text:
                continue
            size = max(sizes) if sizes else 0
            lvl = heading_level(size)
            first = text.split("\n", 1)[0]
            if lvl and (HEADING_RE.match(first) or (lvl >= 3 and len(first) <= 60)):
                parts.append(f"\n{'#' * min(lvl+1, 6)} {first}\n")
                rest = text[len(first):].strip()
                if rest:
                    parts.append(rest)
            elif is_code_like(text):
                parts.append("\n```\n" + text + "\n```\n")
            else:
                parts.append(text + "\n")

        # 表格
        try:
            for tb in page.find_tables():
                md = table_to_md(tb)
                if md:
                    parts.append(f"\n**[表格]**\n\n{md}\n")
        except Exception:
            pass

        # 图片
        for r in extract_images(page, pno):
            parts.append(f"\n{r}\n")

        if pno % 100 == 0:
            print(f"[method3] 进度 {pno}/{total}")

    OUT_FILE.write_text("\n".join(parts), encoding="utf-8")
    doc.close()
    print(f"[method3] 完成, 输出: {OUT_FILE}")

if __name__ == "__main__":
    main()
