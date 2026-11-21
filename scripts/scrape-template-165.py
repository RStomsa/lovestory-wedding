import urllib.request
import re
import json
import html as html_module

uuid = "6e435cd6-d240-4228-af2f-fdcb408e2ac0"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

def fetch_url(url):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        return resp.read().decode("utf-8")

# 1. Fetch detail page
detail_url = "https://cinelove.me/template/thiep-cuoi-165"
print("Fetching detail:", detail_url)
detail_html = fetch_url(detail_url)

# 2. Fetch preview page
preview_url = "https://cinelove.me/template/thiep-cuoi-165/preview?layout=feed"
print("Fetching preview:", preview_url)
preview_html = fetch_url(preview_url)

# Parse metadata
metadata = {}
pos = detail_html.find(uuid)
while pos != -1:
    chunk = detail_html[max(0, pos-200):pos+1200]
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

print("Metadata:", json.dumps(metadata, indent=2, ensure_ascii=False))

# Parse preview elements
decoded_preview = html_module.unescape(preview_html)

# Extract fonts
all_fonts = set(re.findall(r'font-family:\s*\"?([^\";]+)\"?', decoded_preview))
clean_fonts = [f.strip() for f in all_fonts if f.strip() and not f.startswith("-apple")]

# Extract images
all_images = sorted(list(set(re.findall(r'https://assets\.cinelove\.me/templates/assets/' + uuid + r'/[a-zA-Z0-9_\-\.]+', decoded_preview))))
all_plugin_images = sorted(list(set(re.findall(r'https://assets\.cinelove\.me/assets/plugins/[a-zA-Z0-9_\-\.]+', decoded_preview))))

# Parse nodes
node_matches = list(re.finditer(r'<div data-node-id="([^"]+)" style="([^"]+)" class="([^"]+)"', decoded_preview))
print(f"Total node definitions: {len(node_matches)}")

elements = []
for i, m in enumerate(node_matches):
    nid = m.group(1)
    style = m.group(2)
    cls = m.group(3)
    
    start_pos = m.start()
    end_pos = node_matches[i+1].start() if i+1 < len(node_matches) else start_pos + 1500
    chunk = decoded_preview[start_pos:end_pos]
    
    top = re.search(r'top:\s*([\d\.]+)px', style)
    left = re.search(r'left:\s*([\d\.]+)px', style)
    width = re.search(r'width:\s*([\d\.]+)px', style)
    height = re.search(r'height:\s*([\d\.]+)px', style)
    rotate = re.search(r'transform:rotate\(([\d\.\-]+)deg\)', style)
    z_idx = re.search(r'z-index:\s*(\d+)', style)
    
    text_match = re.search(r'contentEditable="false">([\s\S]*?)</div>', chunk)
    text_content = None
    if text_match:
        raw_text = text_match.group(1)
        clean_text = re.sub(r'<[^>]+>', ' ', raw_text).replace('&nbsp;', ' ').strip()
        if clean_text:
            text_content = clean_text
            
    font_f = re.search(r'font-family:\s*\"?([^\";]+)\"?', chunk)
    font_s = re.search(r'font-size:\s*([\d\.]+)px', chunk)
    font_c = re.search(r'color:\s*([^;"]+)', chunk)
    font_w = re.search(r'font-weight:\s*([^;"]+)', chunk)
    
    imgs = re.findall(r'src="(https://assets\.cinelove\.me/[^"]+)"', chunk)
    map_m = re.search(r'src="(https://maps\.google\.com/[^"]+)"', chunk)
    trans_m = re.search(r'data-transition-key="([^"]+)"', chunk)
    
    if text_content or imgs or map_m or "box-component" in cls:
        elements.append({
            "id": nid,
            "classes": cls,
            "top": float(top.group(1)) if top else 0,
            "left": float(left.group(1)) if left else 0,
            "width": float(width.group(1)) if width else None,
            "height": float(height.group(1)) if height else None,
            "rotation": float(rotate.group(1)) if rotate else 0,
            "zIndex": int(z_idx.group(1)) if z_idx else 0,
            "transition": trans_m.group(1) if trans_m else None,
            "type": "text" if text_content else ("map" if map_m else "image"),
            "text": text_content,
            "fontFamily": font_f.group(1).strip() if (text_content and font_f) else None,
            "fontSize": float(font_s.group(1)) if (text_content and font_s) else None,
            "color": font_c.group(1).strip() if (text_content and font_c) else None,
            "fontWeight": font_w.group(1).strip() if (text_content and font_w) else None,
            "images": imgs if imgs else None,
            "mapSrc": map_m.group(1) if map_m else None
        })

elements.sort(key=lambda x: (x["top"], x["left"]))

# Deduplicate
dedup_elements = []
seen_ids = set()
for el in elements:
    if el["id"] not in seen_ids:
        seen_ids.add(el["id"])
        dedup_elements.append(el)

print(f"Parsed {len(dedup_elements)} elements successfully!")

output_data = {
    "templateId": uuid,
    "metadata": metadata,
    "canvas": {
        "width": 500,
        "height": 6200
    },
    "fonts": clean_fonts,
    "templateImages": all_images,
    "pluginAssets": all_plugin_images,
    "elements": dedup_elements
}

with open("src/data/scraped_template_6e435cd6.json", "w", encoding="utf-8") as out:
    json.dump(output_data, out, indent=2, ensure_ascii=False)

print("Saved src/data/scraped_template_6e435cd6.json successfully!")
