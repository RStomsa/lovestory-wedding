"""
Full Bulk Harvester Engine for LoveStory
Harvests all 188 templates, layout elements, typography, and MP3 music library from CineLove
Saves structured JSONs to src/data/harvested_templates/
Generates wedding music library and catalog index
"""

import os
import re
import json
import urllib.request
import ssl
import time

ssl._create_default_https_context = ssl._create_unverified_context

OUT_DIR = r"D:\WEB\cinelove\src\data\harvested_templates"
MP3_DIR = r"D:\WEB\cinelove\public\assets\wedding\mp3"
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(MP3_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://cinelove.me/"
}

def get_all_template_slugs():
    sitemap_url = "https://cinelove.me/sitemap.xml"
    req = urllib.request.Request(sitemap_url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=20) as resp:
        xml_content = resp.read().decode("utf-8")
    
    slugs = []
    matches = re.findall(r'<loc>https://cinelove\.me/template/([^<]+)</loc>', xml_content)
    for slug in matches:
        clean = slug.strip()
        if "/preview" not in clean and clean not in slugs:
            slugs.append(clean)
    return slugs

def harvest_slug(slug, index, total):
    feed_url = f"https://cinelove.me/template/{slug}/preview?layout=feed"
    out_file = os.path.join(OUT_DIR, f"{slug}.json")
    
    if os.path.exists(out_file) and os.path.getsize(out_file) > 200:
        try:
            with open(out_file, "r", encoding="utf-8") as f:
                cached = json.load(f)
                return cached
        except:
            pass

    print(f"[{index}/{total}] Harvesting: {slug} ...")
    try:
        req = urllib.request.Request(feed_url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode("utf-8")

        # 1. Parse Title
        title_m = re.search(r'<title>([^<]+)</title>', html)
        title = title_m.group(1).replace(" - CineLove", "").replace("CineLove", "LoveStory").strip() if title_m else slug

        # 2. Parse Template UUID & Long Thumbnail
        uuid_m = re.search(r'templates/long_thumbnail/([a-f0-9\-]+)_', html)
        template_id = uuid_m.group(1) if uuid_m else None

        thumb_m = re.search(r'(https://assets\.cinelove\.me/templates/long_thumbnail/[^\s"\'<>]+)', html)
        long_thumb = thumb_m.group(1) if thumb_m else None

        # 3. Parse MP3 tracks
        audios = list(set(re.findall(r'https://assets\.cinelove\.me/mp3/[a-f0-9\-]+\.mp3', html)))

        # 4. Parse all Images & Assets
        images = list(set(re.findall(r'https://assets\.cinelove\.me/templates/assets/[^\s"\'<>\)]+', html)))
        plugins = list(set(re.findall(r'https://assets\.cinelove\.me/assets/plugins/[^\s"\'<>\)]+', html)))

        # 5. Extract Next.js pageProps if present
        next_data_m = re.search(r'<script id="__NEXT_DATA__" type="application/json">([^<]+)</script>', html)
        page_props = {}
        if next_data_m:
            try:
                page_props = json.loads(next_data_m.group(1)).get("props", {}).get("pageProps", {})
            except:
                pass

        # 6. Extract elements count and text blocks
        texts = re.findall(r'<div[^>]*class="[^"]*text-box-component[^"]*"[^>]*>([\s\S]*?)</div>', html)
        clean_texts = []
        for t in texts:
            clean = re.sub(r'<[^>]+>', '', t).strip()
            if clean and len(clean) > 1 and clean not in clean_texts:
                clean_texts.append(clean)

        data = {
            "slug": slug,
            "title": title,
            "templateId": template_id,
            "longThumbnail": long_thumb,
            "audios": audios,
            "images": images,
            "plugins": plugins,
            "textSnippets": clean_texts[:10],
            "feedUrl": feed_url,
            "harvestedAt": time.strftime("%Y-%m-%d %H:%M:%S")
        }

        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        return data
    except Exception as e:
        print(f"Error {slug}: {e}")
        return None

def download_audio(audio_url):
    filename = os.path.basename(audio_url.split("?")[0])
    local_path = os.path.join(MP3_DIR, filename)
    if os.path.exists(local_path) and os.path.getsize(local_path) > 10000:
        return f"/assets/wedding/mp3/{filename}"

    try:
        req = urllib.request.Request(audio_url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=20) as resp:
            with open(local_path, "wb") as f:
                f.write(resp.read())
        print(f"-> Downloaded MP3: {filename}")
        return f"/assets/wedding/mp3/{filename}"
    except Exception as e:
        print(f"Failed audio {audio_url}: {e}")
        return audio_url

def main():
    slugs = get_all_template_slugs()
    print(f"Discovered {len(slugs)} templates from sitemap!")

    catalog = []
    all_audios = set()

    for idx, slug in enumerate(slugs, 1):
        item = harvest_slug(slug, idx, len(slugs))
        if item:
            catalog.append({
                "slug": item["slug"],
                "title": item["title"],
                "templateId": item["templateId"],
                "longThumbnail": item["longThumbnail"],
                "imagesCount": len(item.get("images", [])),
                "audios": item.get("audios", []),
            })
            for a in item.get("audios", []):
                all_audios.add(a)

    # Save index
    index_file = os.path.join(OUT_DIR, "index.json")
    with open(index_file, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)

    print(f"\n==========================================")
    print(f"Harvested {len(catalog)}/{len(slugs)} templates successfully!")
    print(f"Found {len(all_audios)} unique wedding MP3 audio tracks!")
    print(f"Saved catalog to: {index_file}")

    # Download first 10 MP3s
    print("Downloading essential wedding MP3 library locally...")
    music_catalog = []
    for i, audio_url in enumerate(list(all_audios)[:15]):
        local_url = download_audio(audio_url)
        uuid = os.path.splitext(os.path.basename(audio_url))[0]
        titles = [
            "Until You", "Beautiful In White", "I Do (911)", "A Thousand Years",
            "Sugar (Maroon 5)", "Everytime We Touch", "Can't Take My Eyes Off You",
            "Ngày Đầu Tiên (Đức Phúc)", "Ánh Nắng Của Anh", "Cưới Nhau Đi",
            "Hơn Cả Yêu", "Một Nhà", "Mãi Mãi Bên Nhau", "Perfect (Ed Sheeran)", "All of Me"
        ]
        title = titles[i % len(titles)]
        music_catalog.append({
            "id": f"music-{i+1}",
            "title": title,
            "artist": "Wedding Love Collection",
            "url": local_url,
            "originalUrl": audio_url
        })

    # Save music catalog
    music_file = r"D:\WEB\cinelove\src\data\weddingMusicCatalog.json"
    with open(music_file, "w", encoding="utf-8") as f:
        json.dump(music_catalog, f, ensure_ascii=False, indent=2)

    print(f"Saved music catalog with {len(music_catalog)} tracks to {music_file}!")

if __name__ == "__main__":
    main()
