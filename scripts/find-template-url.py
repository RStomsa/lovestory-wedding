import urllib.request
import re
import json

uuid = "6e435cd6-d240-4228-af2f-fdcb408e2ac0"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

# Test various endpoints
endpoints = [
    f"https://cinelove.me/template/iframe/{uuid}",
    f"https://cinelove.me/api/template/{uuid}",
    f"https://cinelove.me/api/templates/{uuid}",
    "https://cinelove.me/sitemap.xml",
]

for ep in endpoints:
    try:
        req = urllib.request.Request(ep, headers=headers)
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8', errors='ignore')
            print(f"Status 200 on {ep}, len={len(content)}")
            if uuid in content or "Sẽ luôn có một khoảnh khắc" in content:
                print(" -> FOUND UUID / Text in response!")
            if "sitemap" in ep:
                matches = [line for line in content.split('\n') if 'thiep-cuoi' in line]
                print(f"Sitemap has {len(matches)} wedding template urls")
                with open("sitemap_urls.txt", "w", encoding="utf-8") as f:
                    f.write('\n'.join(matches))
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code} on {ep}")
    except Exception as e:
        print(f"Error on {ep}: {e}")
