import re
import json
import html as html_module

# 1. Parse Metadata from detail page
with open("template_39_detail.html", "r", encoding="utf-8") as f:
    detail_html = f.read()

# Look for JSON payload in Next.js self.__next_f
metadata = {}
uuid = "a2f11727-8717-46db-ada4-ff29271ce53b"
pos = detail_html.find(uuid)
while pos != -1:
    chunk = detail_html[max(0, pos-200):pos+1200]
    # Check if this chunk has JSON properties
    for key in ["templateName", "templateCode", "slug", "templateType", "description", 
                "audioTitle", "audioKey", "audioDuration", "features", "tags"]:
        m = re.search(r'\"' + key + r'\"\:(\"[^\"]+\"|\[[^\]]+\]|\d+|true|false)', chunk)
        if m and key not in metadata:
            val_str = m.group(1)
            try:
                metadata[key] = json.loads(val_str)
            except:
                metadata[key] = val_str
    pos = detail_html.find(uuid, pos+1)

print("--- METADATA EXTRACTED ---")
print(json.dumps(metadata, indent=2, ensure_ascii=False))

# 2. Parse Elements & Layout from preview page
with open("template_39_preview.html", "r", encoding="utf-8") as f:
    raw_preview = f.read()

preview_html = html_module.unescape(raw_preview)

# Extract fonts used
font_matches = set(re.findall(r'font-family:\s*([^;"]+)', preview_html))
fonts = [f.strip().strip("'\"") for f in font_matches if f.strip() and not f.startswith("-apple")]

# Extract all images from assets.cinelove.me
img_urls = sorted(list(set(re.findall(r'https://assets\.cinelove\.me/templates/assets/' + uuid + r'/[a-zA-Z0-9_\-\.]+', preview_html))))
plugin_assets = sorted(list(set(re.findall(r'https://assets\.cinelove\.me/assets/plugins/[a-zA-Z0-9_\-\.]+', preview_html))))

# Extract nodes by data-node-id
chunks = preview_html.split('data-node-id="')
elements = []

for ch in chunks[1:]:
    nid = ch[:ch.find('"')]
    # Parse style
    top_m = re.search(r'top:\s*([\d\.]+)px', ch[:400])
    left_m = re.search(r'left:\s*([\d\.]+)px', ch[:400])
    width_m = re.search(r'width:\s*([\d\.]+)px', ch[:400])
    height_m = re.search(r'height:\s*([\d\.]+)px', ch[:400])
    z_m = re.search(r'z-index:\s*(\d+)', ch[:400])
    
    # Text
    text_m = re.search(r'contentEditable="false">([^<]+)</div>', ch)
    # Font
    font_m = re.search(r'font-family:\s*([^;"]+)', ch)
    size_m = re.search(r'font-size:\s*([\d\.]+)px', ch)
    color_m = re.search(r'color:\s*([^;"]+)', ch)
    
    # Image in this node
    node_imgs = re.findall(r'src="(https://assets\.cinelove\.me/[^"]+)"', ch[:1000])
    
    # Iframe
    iframe_m = re.search(r'src="(https://maps\.google\.com/[^"]+)"', ch[:1000])

    text_val = text_m.group(1).strip() if text_m else None
    font_val = font_m.group(1).strip().strip("'\"") if font_m else None
    
    if text_val or node_imgs or iframe_m:
        elements.append({
            "id": nid,
            "top": float(top_m.group(1)) if top_m else 0,
            "left": float(left_m.group(1)) if left_m else 0,
            "width": float(width_m.group(1)) if width_m else None,
            "height": float(height_m.group(1)) if height_m else None,
            "zIndex": int(z_m.group(1)) if z_m else 0,
            "type": "text" if text_val else ("map" if iframe_m else "image"),
            "text": text_val,
            "fontFamily": font_val,
            "fontSize": float(size_m.group(1)) if size_m else None,
            "color": color_m.group(1).strip() if color_m else None,
            "images": node_imgs if node_imgs else None,
            "mapSrc": iframe_m.group(1) if iframe_m else None
        })

# Sort elements by top
elements.sort(key=lambda x: (x["top"], x["left"]))

# Find max height (canvas height)
max_bottom = 0
for el in elements:
    b = el["top"] + (el["height"] if el["height"] else 0)
    if b > max_bottom:
        max_bottom = b

full_data = {
    "templateId": uuid,
    "metadata": metadata,
    "canvas": {
        "width": 500,
        "height": round(max_bottom)
    },
    "fonts": fonts,
    "templateImages": img_urls,
    "pluginAssets": plugin_assets,
    "totalElements": len(elements),
    "elements": elements
}

with open("template_39_data.json", "w", encoding="utf-8") as out:
    json.dump(full_data, out, indent=2, ensure_ascii=False)

print(f"\n--- SUCCESS ---")
print(f"Canvas: 500 x {round(max_bottom)}px")
print(f"Fonts used: {fonts}")
print(f"Total template images: {len(img_urls)}")
print(f"Plugin assets: {plugin_assets}")
print(f"Total elements: {len(elements)}")
