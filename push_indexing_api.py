import json
import os
import time
from google.oauth2 import service_account
from googleapiclient.discovery import build

os.environ["HTTP_PROXY"] = "http://127.0.0.1:7897"
os.environ["HTTPS_PROXY"] = "http://127.0.0.1:7897"

base_dir = os.path.dirname(__file__)
key_file = os.path.join(base_dir, "service_account.json")
cities_file = os.path.join(base_dir, "src", "data", "cities.json")
appliances_file = os.path.join(base_dir, "src", "data", "appliances.json")

# 读取 100 个城市和 8 大家电
with open(cities_file, "r", encoding="utf-8") as f:
    cities = json.load(f)

with open(appliances_file, "r", encoding="utf-8") as f:
    appliances = json.load(f)

base_url = "https://www.wangdadi.xyz"

# 组装全网 100+ 核心 URL 矩阵
urls_to_push = [
    f"{base_url}/",
    f"{base_url}/calculators/tax-credit",
    f"{base_url}/about",
    f"{base_url}/privacy",
    f"{base_url}/terms"
]

for app in appliances:
    urls_to_push.append(f"{base_url}/appliances/{app['slug']}")

for city in cities:
    urls_to_push.append(f"{base_url}/power/{city['slug']}")

SCOPES = ["https://www.googleapis.com/auth/indexing"]
credentials = service_account.Credentials.from_service_account_file(key_file, scopes=SCOPES)
service = build("indexing", "v3", credentials=credentials)

print(f"[*] 正在通过 Google Indexing API 强力轰炸 {len(urls_to_push)} 个全量页面...")
print("-" * 65)

success_count = 0
for idx, url in enumerate(urls_to_push, 1):
    body = {
        "url": url,
        "type": "URL_UPDATED"
    }
    try:
        response = service.urlNotifications().publish(body=body).execute()
        print(f"[{idx}/{len(urls_to_push)}] [✓ 成功送达] {url}")
        success_count += 1
        time.sleep(0.1)  # 稍微延时，平滑传输
    except Exception as e:
        print(f"[{idx}/{len(urls_to_push)}] [! 失败] {url} -> {e}")

print("-" * 65)
print(f"[*] 极限强推全部完成！成功送达: {success_count}/{len(urls_to_push)} 个页面至 Google 核心优先调度器！")