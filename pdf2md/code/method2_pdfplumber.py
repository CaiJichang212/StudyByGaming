#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
方法2: 使用 pdfplumber 自定义提取。
特性:
  - 通过字号(font size)推断标题层级(H1~H4)
  - 提取表格并转为 markdown 表格
  - 页面中含图片的区域以整页渲染为 PNG 引用(保留图片信息)
  - 保留分页与目录结构
"""
import os
import re
from pathlib import Path
import pdfplumber

PDF_PATH = "/Users/lzc/TNTprojectZ/AprojectZ/projectA/idea0704/docs/CANN社区版 8.5.0 Ascend C算子开发指南 01.pdf"
OUT_DIR = Path("/Users/lzc/TNTprojectZ/AprojectZ/projectA/idea0704/pdf2md/output/method2_pdfplumber")
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
    if size > 10.2:
        return 4
    return 0

def table_to_md(table):
    if not table or len(table) < 1:
        return ""
    rows = [[(c or "").replace("\n", " ").strip() for c in row] for row in table]
    ncols = max(len(r) for r in rows)
    rows = [r + [""] * (ncols - len(r)) for r in rows]
    header = rows[0]
    body = rows[1:] if len(rows) > 1 else []
    md = ["| " + " | ".join(header) + " |",
          "| " + " | ".join(["---"] * ncols) + " |"]
    for r in body:
        md.append("| " + " | ".join(r) + " |")
    return "\n".join(md)

def line_bbox_ys(chars):
    ys = sorted(c["top"] for c in chars)
    return ys[0] if ys else 0

def extract_page_markdown(page, page_no, total):
    out = []
    chars = page.chars
    if not chars:
        # 无文本，尝试整页渲染为图片
        return render_page_image(page, page_no)

    # 按 行 分组
    chars_sorted = sorted(chars, key=lambda c: (round(c["top"]), c["x0"]))
    lines = []
    cur = []
    cur_top = None
    for c in chars_sorted:
        if cur_top is None or abs(c["top"] - cur_top) <= 3:
            cur.append(c)
            cur_top = c["top"] if cur_top is None else cur_top
        else:
            lines.append(cur)
            cur = [c]
            cur_top = c["top"]
    if cur:
        lines.append(cur)

    for line in lines:
        text = "".join(c["text"] for c in sorted(line, key=lambda c: c["x0"]))
        text = text.strip()
        if not text:
            continue
        size = max(round(c["size"], 1) for c in line)
        lvl = heading_level(size)
        if lvl and HEADING_RE.match(text):
            out.append(f"\n{'#' * min(lvl+1, 6)} {text}\n")
        elif lvl >= 3 and len(text) <= 60 and not text.endswith(("。", "，", "；")):
            out.append(f"\n{'#' * min(lvl+1, 6)} {text}\n")
        else:
            out.append(text)

    # 表格
    try:
        tables = page.extract_tables()
    except Exception:
        tables = []
    for i, t in enumerate(tables):
        mdt = table_to_md(t)
        if mdt:
            out.append(f"\n**[表格]**\n\n{mdt}\n")

    out.append(f"\n<!-- page {page_no} / {total} -->\n")
    return "\n".join(out)

def render_page_image(page, page_no):
    try:
        im = page.to_image(resolution=120)
        fname = f"page_{page_no:05d}.png"
        im.save(str(IMG_DIR / fname))
        return f"\n![页面图片](images/{fname})\n"
    except Exception as e:
        return f"\n<!-- 图片渲染失败 page {page_no}: {e} -->\n"

def main():
    print(f"[method2] 打开: {PDF_PATH}")
    parts = ["# CANN社区版 8.5.0 Ascend C 算子开发指南\n",
             "> 由 pdfplumber 自动转换，保留目录结构、表格、图片。\n"]
    with pdfplumber.open(PDF_PATH) as pdf:
        total = len(pdf.pages)
        print(f"[method2] 总页数: {total}")
        for i, page in enumerate(pdf.pages, start=1):
            try:
                parts.append(extract_page_markdown(page, i, total))
            except Exception as e:
                parts.append(f"\n<!-- 第 {i} 页提取失败: {e} -->\n")
            if i % 100 == 0:
                print(f"[method2] 进度 {i}/{total}")
            # 提取嵌入图片(裁剪图片区域渲染，避免整页渲染耗时)
            for img in page.images:
                try:
                    cropped = page.within_bbox((img["x0"], img["top"], img["x1"], img["bottom"]))
                    im = cropped.to_image(resolution=120)
                    fname = f"p{i:05d}_img.png"
                    im.save(str(IMG_DIR / fname))
                    parts.append(f"\n![图片](images/{fname})\n")
                except Exception:
                    pass
        OUT_FILE.write_text("\n".join(parts), encoding="utf-8")
    print(f"[method2] 完成, 输出: {OUT_FILE}")

if __name__ == "__main__":
    main()
