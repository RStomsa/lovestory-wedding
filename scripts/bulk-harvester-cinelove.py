"""
Bulk Harvester Script for LoveStory
Harvests all template metadata, layout coordinates, typography, and assets from CineLove
Saves structured JSONs into src/data/harvested_templates/
"""

import os
import re
import json
import urllib.request
import ssl
from bs4 import BeautifulSoup

ssl._create_default_https_context = ssl._create_unverified_context

OUTPUT_DIR = r"D:\WEB\cinelove\src\data\harvested_templates"
os.makedirs(OUTPUT_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://cinelove.me/"
}

def get_all_template_slugs():
    sitemap_url = "https://cinelove.me/sitemap.xml"
    req = urllib.request.Request(sitemap_url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as resp:
        xml_content = resp.read().decode("utf-8")
    
    slugs = []
    # Match <loc>https://cinelove.me/template/(.+?)</loc>
    matches = re.findall(r'<loc>https://cinelove\.me/template/([^<]+)</loc>', xml_content)
    for slug in matches:
        if "/preview" not in slug and slug not in slugs:
            slugs.append(slug)
    return slugs

def harvest_template(slug):
    feed_url = f"https://cinelove.me/template/{slug}/preview?layout=feed"
    out_file = os.path.join(OUTPUT_DIR, f"{slug}.json")
    if os.path.exists(out_file):
        print(f"Skipping already harvested: {slug}")
        return True

    print(f"Harvesting: {slug} ...")
    try:
        req = urllib.request.Request(feed_url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode("utf-8")

        soup = BeautifulSoup(html, "html.parser")
        
        # 1. Extract Next.js page data if present
        next_data_tag = soup.find("script", id="__NEXT_DATA__")
        page_props = {}
        if next_data_tag and next_data_tag.string:
            try:
                page_props = json.loads(next_data_tag.string).get("props", {}).get("pageProps", {})
            except:
                pass

        # 2. Extract DOM elements
        elements = []
        for tag in soup.find_all(attrs={"class": True}):
            cls = " ".join(tag.get("class", []))
            if "component" in cls or "text-box" in cls or "image-component" in cls:
                style = tag.get("style", "")
                text_content = tag.get_text(strip=True)
                img = tag.find("img")
                img_src = img.get("src") if img else None
                elements.append({
                    "id": tag.get("id") or f"el-{len(elements)}",
                    "class": cls,
                    "style": style,
                    "text": text_content if text_content else None,
                    "imageSrc": img_src
                })

        # 3. Extract all images and audios
        all_images = list(set(re.findall(r'https://assets\.cinelove\.me/templates/assets/[^\s"\'<>)]+', html)))
        all_audios = list(set(re.findall(r'https://assets\.cinelove\.me/mp3/[^\s"\'<>)]+', html)))

        data = {
            "slug": slug,
            "feedUrl": feed_url,
            "pageProps": page_props,
            "elementCount": len(elements),
            "elements": elements,
            "images": all_images,
            "audios": all_audios
        }

        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"-> Saved {slug}: {len(elements)} elements, {len(all_images)} images, {len(all_audios)} audios.")
        return True
    except Exception as e:
        print(f"Error harvesting {slug}: {e}")
        return False

if __name__ == "__main__":
    slugs = get_all_template_slugs()
    print(f"Found {len(slugs)} templates in sitemap!")
    # Test harvest first 5 templates
    for slug in slugs[:5]:
        harvest_template(slug)
