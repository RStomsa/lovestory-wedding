import json
import os
import urllib.request
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

out_dir = r"D:\WEB\cinelove\public\assets\wedding\templates\c165"
os.makedirs(out_dir, exist_ok=True)

with open(r"D:\WEB\cinelove\src\data\scraped_template_6e435cd6.json", "r", encoding="utf-8") as f:
    data = json.load(f)

images = data.get("templateImages", [])
print(f"Found {len(images)} images to download...")

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://cinelove.me/"
}

local_map = {}
for i, url in enumerate(images):
    ext = os.path.splitext(url.split("?")[0])[-1] or ".jpg"
    filename = f"photo_{i+1:02d}{ext}"
    local_path = os.path.join(out_dir, filename)
    public_path = f"/assets/wedding/templates/c165/{filename}"
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            with open(local_path, "wb") as out_f:
                out_f.write(resp.read())
        print(f"Downloaded [{i+1}/{len(images)}]: {filename}")
        local_map[url] = public_path
    except Exception as e:
        print(f"Failed {url}: {e}")

# Download plugin assets if any
for plugin_url in data.get("pluginAssets", []):
    filename = os.path.basename(plugin_url.split("?")[0])
    local_path = os.path.join(r"D:\WEB\cinelove\public\assets\wedding\plugins", filename)
    if not os.path.exists(local_path):
        try:
            req = urllib.request.Request(plugin_url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                with open(local_path, "wb") as out_f:
                    out_f.write(resp.read())
            print(f"Downloaded plugin asset: {filename}")
        except Exception as e:
            print(f"Failed plugin {plugin_url}: {e}")

# Save updated local paths in json
data["localImages"] = list(local_map.values())
with open(r"D:\WEB\cinelove\src\data\scraped_template_6e435cd6.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("All done!")
