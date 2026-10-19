#!/usr/bin/env python3
"""
sample-extract-images.py
Tests drawing coordinate extraction from 'Icon Website Product Info - Mrora.v3 (1).xlsx'
Extracts embedded images for 5 sample Rogers products, sorting multiple images in the same
row strictly from left-to-right, and converts them to modern WebP format.
"""

import os
import zipfile
import json
import xml.etree.ElementTree as ET
from PIL import Image
import io

EXCEL_FILE = "Icon Website Product Info - Mrora.v3 (1).xlsx"
OUTPUT_DIR = os.path.join("public", "extracted-samples")

SAMPLE_TARGET_ROWS = {
    2: {"name": "RT/duroid 5880", "slug": "rt-duroid-5880", "category": "RT/Duroid"},
    9: {"name": "RO4350B", "slug": "ro4350b", "category": "RO400 Series"},
    10: {"name": "RO4003C", "slug": "ro4003c", "category": "RO400 Series"},
    21: {"name": "TMM 10i", "slug": "tmm-10i", "category": "TMM Series"},
    29: {"name": "TC350", "slug": "tc350", "category": "TC Series"}
}

def extract_samples():
    if not os.path.exists(EXCEL_FILE):
        print(f"Error: {EXCEL_FILE} not found.")
        return

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    z = zipfile.ZipFile(EXCEL_FILE)

    # 1. Parse drawing relationships
    rels_path = "xl/drawings/_rels/drawing1.xml.rels"
    if rels_path not in z.namelist():
        print(f"Error: {rels_path} not found in zip archive.")
        return

    rels_root = ET.fromstring(z.read(rels_path))
    rel_map = {}
    for r in rels_root.findall("{http://schemas.openxmlformats.org/package/2006/relationships}Relationship"):
        rel_map[r.attrib["Id"]] = r.attrib["Target"]

    # 2. Parse drawing XML anchors
    draw_path = "xl/drawings/drawing1.xml"
    d_root = ET.fromstring(z.read(draw_path))

    # Map excel_row -> list of (col, col_off, media_target)
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
                    # Resolve relative path: '../media/image1.jpeg' -> 'xl/media/image1.jpeg'
                    media_path = target.replace("../", "xl/")
                    excel_row = row + 1  # 0-indexed to 1-indexed Excel row
                    if excel_row not in row_images:
                        row_images[excel_row] = []
                    row_images[excel_row].append((col, col_off, media_path))

    # 3. Process sample products
    results = []
    print(f"--- Processing {len(SAMPLE_TARGET_ROWS)} Sample Products from Excel ---")

    for r_idx, prod_info in SAMPLE_TARGET_ROWS.items():
        images_for_row = row_images.get(r_idx, [])
        # Strict left-to-right sort: primary by column index, secondary by column offset
        images_for_row.sort(key=lambda item: (item[0], item[1]))

        prod_record = {
            "row": r_idx,
            "name": prod_info["name"],
            "slug": prod_info["slug"],
            "category": prod_info["category"],
            "total_images_in_row": len(images_for_row),
            "images": []
        }

        if not images_for_row:
            print(f"Row {r_idx:2d} | {prod_info['name']:<18} | 0 images (Option B: Marked draft/uncompleted)")
        else:
            for order, (col, col_off, media_path) in enumerate(images_for_row, start=1):
                raw_bytes = z.read(media_path)
                image = Image.open(io.BytesIO(raw_bytes))
                
                # Convert RGBA to RGB for clean WebP compression if needed
                if image.mode in ("RGBA", "P"):
                    image = image.convert("RGB")

                # Resize if wider than 1200px
                if image.width > 1200:
                    ratio = 1200 / float(image.width)
                    new_height = int(float(image.height) * float(ratio))
                    image = image.resize((1200, new_height), Image.Resampling.LANCZOS)

                # Save as WebP
                role = "primary_hero" if order == 1 else f"gallery_{order}"
                out_filename = f"rogers_{prod_info['slug']}_{order}.webp"
                out_path = os.path.join(OUTPUT_DIR, out_filename)
                image.save(out_path, "WEBP", quality=82)

                filesize_kb = round(os.path.getsize(out_path) / 1024, 1)
                img_data = {
                    "display_order": order,
                    "role": role,
                    "is_primary": (order == 1),
                    "excel_col": col,
                    "col_offset": col_off,
                    "original_source": media_path,
                    "saved_file": f"/extracted-samples/{out_filename}",
                    "width": image.width,
                    "height": image.height,
                    "size_kb": filesize_kb,
                    "alt_text": f"Rogers {prod_info['name']} {prod_info['category']} Material"
                }
                prod_record["images"].append(img_data)
                print(f"Row {r_idx:2d} | {prod_info['name']:<18} | Image {order} (Col {col}) -> {out_filename} ({filesize_kb} KB, {image.width}x{image.height})")

        results.append(prod_record)

    # Save summary report JSON
    report_path = os.path.join(OUTPUT_DIR, "sample_extraction_report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print(f"\nSample extraction verified! Report written to: {report_path}")

if __name__ == "__main__":
    extract_samples()
