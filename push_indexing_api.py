import json
import os
import time
from google.oauth2 import service_account
from googleapiclient.discovery import build

# 1. 强制走本地代理（确保国内网络畅通连接 Google API）
os.environ["HTTP_PROXY"] = "http://127.0.0.1:7897"
os.environ["HTTPS_PROXY"] = "http://127.0.0.1:7897"

base_dir = os.path.dirname(__file__)
key_file = os.path.join(base_dir, "service_account.json")

# 2. 全网 33 个核心页面全量清单（覆盖所有城市、家电与理财工具）
urls_to_push = [
    # 核心首页与独立理财工具
    "https://www.wangdadi.xyz/",
    "https://www.wangdadi.xyz/calculators/tax-credit",
    "https://www.wangdadi.xyz/about",
    "https://www.wangdadi.xyz/privacy",
    "https://www.wangdadi.xyz/terms",

    # 8 大家电高痛点测算专页
    "https://www.wangdadi.xyz/appliances/run-refrigerator-on-solar-generator",
    "https://www.wangdadi.xyz/appliances/run-cpap-on-solar-generator",
    "https://www.wangdadi.xyz/appliances/run-sump-pump-on-solar-generator",
    "https://www.wangdadi.xyz/appliances/run-portable-ac-on-solar-generator",
    "https://www.wangdadi.xyz/appliances/run-electric-space-heater-on-solar-generator",
    "https://www.wangdadi.xyz/appliances/run-wifi-router-and-starlink-on-solar-generator",
    "https://www.wangdadi.xyz/appliances/run-microwave-and-coffee-maker-on-solar-generator",
    "https://www.wangdadi.xyz/appliances/run-smart-tv-and-entertainment-on-solar-generator",

    # 20 个高断电风险与极端气候城市指南
    "https://www.wangdadi.xyz/power/florida-miami",
    "https://www.wangdadi.xyz/power/florida-tampa",
    "https://www.wangdadi.xyz/power/florida-orlando",
    "https://www.wangdadi.xyz/power/florida-jacksonville",
    "https://www.wangdadi.xyz/power/texas-houston",
    "https://www.wangdadi.xyz/power/texas-dallas",
    "https://www.wangdadi.xyz/power/texas-austin",
    "https://www.wangdadi.xyz/power/texas-san-antonio",
    "https://www.wangdadi.xyz/power/texas-fort-worth",
    "https://www.wangdadi.xyz/power/california-los-angeles",
    "https://www.wangdadi.xyz/power/california-san-diego",
    "https://www.wangdadi.xyz/power/california-sacramento",
    "https://www.wangdadi.xyz/power/louisiana-new-orleans",
    "https://www.wangdadi.xyz/power/north-carolina-raleigh",
    "https://www.wangdadi.xyz/power/georgia-atlanta",
    "https://www.wangdadi.xyz/power/arizona-phoenix",
    "https://www.wangdadi.xyz/power/nevada-las-vegas",
    "https://www.wangdadi.xyz/power/south-carolina-charleston",
    "https://www.wangdadi.xyz/power/minnesota-minneapolis",
    "https://www.wangdadi.xyz/power/colorado-denver"
]

SCOPES = ["https://www.googleapis.com/auth/indexing"]
credentials = service_account.Credentials.from_service_account_file(key_file, scopes=SCOPES)
service = build("indexing", "v3", credentials=credentials)

print(f"[*] 正在通过 Google Indexing API 强行全量推送 {len(urls_to_push)} 个页面...")
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
        time.sleep(0.2)  # 轻微延时，防止触发瞬时频控
    except Exception as e:
        print(f"[{idx}/{len(urls_to_push)}] [! 失败] {url} -> {e}")

print("-" * 65)
print(f"[*] 全量推送大功告成！成功推送: {success_count}/{len(urls_to_push)} 个页面")
print("[*] 调度指令已直达 Google 核心流水线，Googlebot 将在未来数小时内密集巡逻全站！")