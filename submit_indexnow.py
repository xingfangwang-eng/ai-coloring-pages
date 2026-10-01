import json
import urllib.request
import os

# 读取当前所有的城市和家电路由
base_dir = os.path.dirname(__file__)
cities_file = os.path.join(base_dir, "src", "data", "cities.json")
appliances_file = os.path.join(base_dir, "src", "data", "appliances.json")

with open(cities_file, "r", encoding="utf-8") as f:
    cities = json.load(f)

with open(appliances_file, "r", encoding="utf-8") as f:
    appliances = json.load(f)

# 汇总全站 32 个核心 URL
url_list = [
    "https://www.wangdadi.xyz/",
    "https://www.wangdadi.xyz/about",
    "https://www.wangdadi.xyz/privacy",
    "https://www.wangdadi.xyz/terms",
]

for c in cities:
    url_list.append(f"https://www.wangdadi.xyz/power/{c['slug']}")

for a in appliances:
    url_list.append(f"https://www.wangdadi.xyz/appliances/{a['slug']}")

# 构造 IndexNow API 请求载荷
payload = {
    "host": "www.wangdadi.xyz",
    "key": "bc648af1321e49c597f7ebcdbefdeb4b",
    "keyLocation": "https://www.wangdadi.xyz/bc648af1321e49c597f7ebcdbefdeb4b.txt",
    "urlList": url_list
}

req = urllib.request.Request(
    "https://api.indexnow.org/IndexNow",
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json; charset=utf-8"}
)

try:
    with urllib.request.urlopen(req) as response:
        if response.status in [200, 202]:
            print(f"[✓] 成功通过 IndexNow 协议向全网广播推送 {len(url_list)} 个网址！(HTTP {response.status})")
        else:
            print(f"[!] 响应状态: {response.status}")
except Exception as e:
    print(f"[!] 推送异常: {e}")