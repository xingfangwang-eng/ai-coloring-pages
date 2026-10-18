import os
import requests

# 1. 代理配置（保持与你本地 7897 端口一致）
os.environ["HTTP_PROXY"] = "http://127.0.0.1:7897"
os.environ["HTTPS_PROXY"] = "http://127.0.0.1:7897"

DEVTO_API_KEY = "tfxPoN6f14uFAiX34Vz39ZAM"
API_URL = "https://dev.to/api/articles"

headers = {
    "api-key": DEVTO_API_KEY,
    "Content-Type": "application/json",
    "User-Agent": "PowerReadyHub-SEO-Bot/1.0"
}

# 2. 补发第 3 篇：全美 50 城市灾害电网大矩阵技术分析
article_data = {
    "title": "Mapping Regional Grid Vulnerabilities Across 50 US Metropolitan Storm Corridors",
    "tags": ["data", "opensource", "analytics", "python"],
    "series": "PowerReady Engineering Series",
    "body_markdown": """# Mapping Regional Grid Vulnerabilities Across 50 US Metropolitan Storm Corridors

Electrical grid infrastructure in the United States faces asymmetric weather vulnerabilities depending on localized geography. While coastal Florida contends with shallow storm surge substation flooding, Texas faces severe thermal stress on its independent ERCOT grid.

To provide disaster readiness planners and telecommuters with actionable benchmarks, our research group cataloged outage duration patterns across **50 major metropolitan corridors**.

---

## 📊 Key Hazard Findings

* **Gulf Coast (Miami, Tampa, Houston, New Orleans):** Historical multi-day blackout duration averages **72 to 144 hours** following major hurricane landfalls. Sump pump continuous power and refrigeration in high humidity are vital.
* **Texas Central & Northern (Dallas, Austin):** Radial ice loading on overhead distribution lines leads to extensive branch failures, creating **24 to 72-hour** sub-zero winter outages.
* **California Wildfire Corridors (Los Angeles, San Diego):** High-wind Santa Ana events trigger utility Public Safety Power Shutoffs (PSPS), cutting power for **24 to 48 hours**.

---

## 🔗 Open Access Dataset & Regional Tools

We have open-sourced the underlying research and regional datasheets for public analysis:

* 👉 **Interactive Metropolitan Guides:** [Explore 20+ Regional Outage Calculators](https://www.wangdadi.xyz/#regional-guides)
* 👉 **Miami Hurricane Emergency Guide:** [Miami Baseline Sizing Datasheet](https://www.wangdadi.xyz/power/florida-miami)
* 👉 **Houston ERCOT Grid Analysis:** [Houston Freeze & Hurricane Setup](https://www.wangdadi.xyz/power/texas-houston)
* 👉 **Full Raw Dataset on GitHub:** [US-Emergency-Power-Outage-Dataset-2026](https://github.com/wangxf0892/US-Emergency-Power-Outage-Dataset-2026)
"""
}

payload = {
    "article": {
        "title": article_data["title"],
        "published": True,
        "body_markdown": article_data["body_markdown"],
        "tags": article_data["tags"],
        "series": article_data["series"]
    }
}

print("[*] 正在向 Dev.to (DA 85+) 补发第 3 篇技术长文...")
print("-" * 65)

try:
    response = requests.post(API_URL, json=payload, headers=headers, timeout=15)
    if response.status_code == 201:
        data = response.json()
        print("[✓ 补发成功!] 第 3 篇文章已正式公开上线:")
        print(f"      URL: {data.get('url')}")
    else:
        print(f"[! 补发失败] HTTP {response.status_code}: {response.text}")
except Exception as e:
    print(f"[! 网络异常]: {e}")

print("-" * 65)