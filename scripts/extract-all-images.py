#!/usr/bin/env python3
"""
extract-all-images.py
Extracts ALL embedded product pictures from 'Icon Website Product Info - Mrora.v3 (1).xlsx'
(Sheet: 'Product Pics').

Key Features:
1. Matches every image to its exact OEM and Product/Category Item across all 15 OEMs.
2. For products with multiple pictures in the same row, sorts them strictly LEFT-TO-RIGHT
   using OpenXML column index and column offset coordinates.
3. Automatically sets Image #1 (leftmost) as the primary hero image, and subsequent
   images as gallery images.
4. Resizes large images (max 1200px width) and converts to modern compressed WebP.
5. Outputs a complete extraction manifest JSON for database seeding and Admin panel.
"""

import os
import re
import zipfile
import json
import io
import xml.etree.ElementTree as ET
from PIL import Image

EXCEL_FILE = "Icon Website Product Info - Mrora.v3 (1).xlsx"
OUTPUT_DIR = os.path.join("public", "catalog-images")

def clean_name(text):
    if not text:
        return ""
    # Remove non-ascii replacement characters
    text = text.replace('\ufffd', '').replace('', '')
    return text.strip()

def slugify(text):
    if not text:
        return "unnamed"
    text = clean_name(text).lower()
    text = re.sub(r'[\u2126\u03A9]', 'ohm', text)  # Replace Omega symbol with ohm
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = text.strip('-')
    return text or "unnamed"

def extract_all():
    if not os.path.exists(EXCEL_FILE):
        print(f"Error: {EXCEL_FILE} not found.")
        return

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    z = zipfile.ZipFile(EXCEL_FILE)

    # 1. Read shared strings
    strings = []
    if "xl/sharedStrings.xml" in z.namelist():
        s_root = ET.fromstring(z.read("xl/sharedStrings.xml"))
        for si in s_root.findall("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si"):
            t_nodes = si.findall(".//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t")
            strings.append("".join(n.text or "" for n in t_nodes))

    # 2. Read Sheet 3 (Product Pics)
    sheet_root = ET.fromstring(z.read("xl/worksheets/sheet3.xml"))
    row_meta = {}
    current_oem = "General"
    current_cat = "General"

    for row in sheet_root.iter("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row"):
        r_idx = int(row.attrib["r"])
        row_cells = {}
        for c in row.iter("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c"):
            ref = c.attrib["r"]
            col = "".join([ch for ch in ref if ch.isalpha()])
            val_elem = c.find("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v")
            if val_elem is not None:
                v = val_elem.text
                if c.attrib.get("t") == "s":
                    v = strings[int(v)]
                row_cells[col] = clean_name(v)

        oem_val = row_cells.get("A", "")
        if oem_val and oem_val != "OEM Name":
            current_oem = oem_val

        cat_val = row_cells.get("D", "")
        if cat_val and cat_val != "Categories":
            current_cat = cat_val

        prod_val = row_cells.get("E") or row_cells.get("D") or row_cells.get("B") or ""
        if prod_val and prod_val not in ("Products", "Categories", "OEM Name"):
            row_meta[r_idx] = {
                "row": r_idx,
                "oem": current_oem,
                "category": current_cat,
                "product": prod_val,
                "oem_slug": slugify(current_oem),
                "prod_slug": slugify(prod_val)
            }

    # 3. Read Drawing Relationships
    rels_root = ET.fromstring(z.read("xl/drawings/_rels/drawing1.xml.rels"))
    rel_map = {}
    for r in rels_root.findall("{http://schemas.openxmlformats.org/package/2006/relationships}Relationship"):
        rel_map[r.attrib["Id"]] = r.attrib["Target"]

    # 4. Read Drawing Anchors
    d_root = ET.fromstring(z.read("xl/drawings/drawing1.xml"))
    row_images = {}

    for anchor in list(d_root):
        from_elem = anchor.find("{http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing}from")
        pic_elem = anchor.find("{http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing}pic")
        if from_elem is not None and pic_elem is not None:
            col = int(from_elem.find("{http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing}col").text)
            col_off = int(from_elem.find("{http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing}colOff").text or 0)
            row = int(from_elem.find("{http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing}row").text)
            
            blip = pic_elem.find(".//{http://schemas.openxmlformats.org/drawingml/2006/main}blip")
            if blip is not None:
                embed_id = blip.attrib.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed")
                target = rel_map.get(embed_id)
                if target:
                    media_path = target.replace("../", "xl/")
                    excel_row = row + 1  # 0-indexed to 1-indexed Excel row
                    if excel_row not in row_images:
                        row_images[excel_row] = []
                    row_images[excel_row].append({
                        "col": col,
                        "col_offset": col_off,
                        "media_path": media_path
                    })

    # 5. Extract and process images sorted strictly left-to-right
    print("=" * 75)
    print("EXTRACTING ALL EMBEDDED PRODUCT IMAGES (LEFT-TO-RIGHT SORTING)")
    print("=" * 75)

    extracted_records = []
    total_images_processed = 0

    for r_idx, meta in sorted(row_meta.items()):
        images = row_images.get(r_idx, [])
        # Strict left-to-right sort
        images.sort(key=lambda img: (img["col"], img["col_offset"]))

        record = {
            "row": r_idx,
            "oem": meta["oem"],
            "oem_slug": meta["oem_slug"],
            "category": meta["category"],
            "product": meta["product"],
            "prod_slug": meta["prod_slug"],
            "total_images": len(images),
            "images": []
        }

        for order, img_info in enumerate(images, start=1):
            raw_bytes = z.read(img_info["media_path"])
            try:
                img = Image.open(io.BytesIO(raw_bytes))
            except Exception as e:
                print(f"Warning: Failed to parse {img_info['media_path']}: {e}")
                continue

            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")

            # Max width 1200px
            if img.width > 1200:
                ratio = 1200 / float(img.width)
                new_height = int(float(img.height) * float(ratio))
                img = img.resize((1200, new_height), Image.Resampling.LANCZOS)

            # WebP filename: [oem]__[prod]_[order].webp
            filename = f"{meta['oem_slug']}__{meta['prod_slug']}_{order}.webp"
            out_path = os.path.join(OUTPUT_DIR, filename)
            img.save(out_path, "WEBP", quality=82)

            filesize_kb = round(os.path.getsize(out_path) / 1024, 1)
            img_entry = {
                "display_order": order,
                "is_primary": (order == 1),
                "role": "hero_primary" if order == 1 else f"gallery_{order}",
                "filename": filename,
                "url": f"/catalog-images/{filename}",
                "width": img.width,
                "height": img.height,
                "size_kb": filesize_kb,
                "excel_col": img_info["col"],
                "col_offset": img_info["col_offset"],
                "alt_text": f"{meta['oem']} {meta['product']} {meta['category']} - Image {order}"
            }
            record["images"].append(img_entry)
            total_images_processed += 1

        extracted_records.append(record)
        if images:
            print(f"Row {r_idx:3d} | {meta['oem']:<18} | {meta['product'][:24]:<24} | {len(images)} image(s) processed (L-to-R)")

    # Save manifest report JSON
    report_file = os.path.join(OUTPUT_DIR, "full_extraction_report.json")
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump({
            "total_product_rows": len(row_meta),
            "total_images_extracted": total_images_processed,
            "products": extracted_records
        }, f, indent=2)

    print("=" * 75)
    print(f"Extraction Complete! Processed {total_images_processed} images across {len(row_meta)} items.")
    print(f"Report saved to: {report_file}")
    print("=" * 75)

if __name__ == "__main__":
    extract_all()
