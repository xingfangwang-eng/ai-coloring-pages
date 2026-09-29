import json
import os

# 精选第一批涵盖【飓风带】、【冬暴冰冻带】、【山火断电带】的高风险城市
cities = [
    # 佛罗里达州（飓风高危）
    {
        "slug": "florida-miami",
        "cityName": "Miami",
        "stateName": "Florida",
        "stateCode": "FL",
        "primaryThreat": "Category 3+ Hurricanes & Extreme Flooding",
        "riskType": "Hurricane",
        "riskLevel": "Critical (High Multi-Day Risk)",
        "recommendedCapacity": "2000Wh+ (Run Fridge & Portable AC)",
        "localAnalysis": "Miami experiences severe summer hurricanes where high humidity and intense heat make running refrigerators and portable air conditioning essential during grid failures lasting 3-7 days.",
        "topPickName": "EcoFlow DELTA 2 Max (2048Wh)",
        "topPickClass": "Heavy-Duty Emergency Backup",
        "topPickAsin": "B0C77J1S1N",
        "topPickReason": "2400W AC output can easily start full-sized kitchen refrigerators and dual-hose portable AC units in hot humid weather.",
        "budgetPickName": "Jackery Explorer 1000 v2 (1070Wh)",
        "budgetPickClass": "Mid-Sized Essential",
        "budgetPickAsin": "B0D1GBG6Y5",
        "budgetPickReason": "Fast 1-hour AC wall recharge before the storm makes landfall; handles CPAP machines and basic lighting."
    },
    {
        "slug": "florida-tampa",
        "cityName": "Tampa",
        "stateName": "Florida",
        "stateCode": "FL",
        "primaryThreat": "Gulf Coast Storm Surges & Tropical Storms",
        "riskType": "Hurricane",
        "riskLevel": "High",
        "recommendedCapacity": "1500Wh - 2000Wh",
        "localAnalysis": "Tampa Bay's shallow coastline causes storm surges that frequently take down localized substations, requiring off-grid solar recharging capabilities.",
        "topPickName": "Anker SOLIX F2000 (2048Wh)",
        "topPickClass": "Long-Lifecycle LiFePO4 Station",
        "topPickAsin": "B0BX9T1K94",
        "topPickReason": "InfiniPower LiFePO4 battery lasts 10 years and withstands damp garage storage conditions.",
        "budgetPickName": "Bluetti AC180 (1152Wh)",
        "budgetPickClass": "Compact 1800W Inverter",
        "budgetPickAsin": "B0C1SQZ5K3",
        "budgetPickReason": "Delivers 1800W pure sine wave power at an accessible price point for keeping critical electronics alive."
    },

    # 德克萨斯州（极寒暴雪与独立电网脆弱性）
    {
        "slug": "texas-houston",
        "cityName": "Houston",
        "stateName": "Texas",
        "stateCode": "TX",
        "primaryThreat": "Severe Gulf Hurricanes & Winter Freezes",
        "riskType": "Hurricane & Winter Freeze",
        "riskLevel": "Very High",
        "recommendedCapacity": "2000Wh+",
        "localAnalysis": "Houston faces a dual threat: summer tropical storms like Beryl and sudden winter freezes that overload the ERCOT independent grid.",
        "topPickName": "EcoFlow DELTA 2 Max (2048Wh)",
        "topPickClass": "Expandable Emergency Station",
        "topPickAsin": "B0C77J1S1N",
        "topPickReason": "Expandable up to 6kWh with extra batteries to outlast extended multi-day ERCOT grid collapses.",
        "budgetPickName": "Jackery Explorer 1000 v2 (1070Wh)",
        "budgetPickClass": "Emergency Starter Unit",
        "budgetPickAsin": "B0D1GBG6Y5",
        "budgetPickReason": "Safe indoor operation without the deadly carbon monoxide risks associated with traditional gas generators."
    },
    {
        "slug": "texas-dallas",
        "cityName": "Dallas",
        "stateName": "Texas",
        "stateCode": "TX",
        "primaryThreat": "Ice Storms & Sub-Freezing Power Outages",
        "riskType": "Winter Storm",
        "riskLevel": "High (Winter Grid Strain)",
        "recommendedCapacity": "1500Wh+",
        "localAnalysis": "Freezing rain and ice in North Texas frequently snap power lines. Keeping electric heating blankets and medical equipment powered indoors is the top priority.",
        "topPickName": "Anker SOLIX F2000 (2048Wh)",
        "topPickClass": "Heavy Indoor Safe Battery",
        "topPickAsin": "B0BX9T1K94",
        "topPickReason": "Powers 1500W space heaters on low settings to maintain emergency warmth in isolated bedrooms.",
        "budgetPickName": "Bluetti AC180 (1152Wh)",
        "budgetPickClass": "Rapid-Charge Station",
        "budgetPickAsin": "B0C1SQZ5K3",
        "budgetPickReason": "Can recharge in 45 minutes when power briefly flickers back on between rolling blackouts."
    },
    {
        "slug": "texas-austin",
        "cityName": "Austin",
        "stateName": "Texas",
        "stateCode": "TX",
        "primaryThreat": "Winter Freeze Grid Overload & Summer Heatwaves",
        "riskType": "Grid Strain",
        "riskLevel": "Moderate-High",
        "recommendedCapacity": "1000Wh - 2000Wh",
        "localAnalysis": "Austin's extensive tree canopy causes fallen iced branches to wipe out local neighborhoods for up to a week during annual winter ice freezes.",
        "topPickName": "EcoFlow DELTA 2 Max (2048Wh)",
        "topPickClass": "App-Controlled LiFePO4 Station",
        "topPickAsin": "B0C77J1S1N",
        "topPickReason": "Features 0-millisecond EPS switchover to keep home office workstations and Wi-Fi routers running seamlessly.",
        "budgetPickName": "EcoFlow RIVER 2 Pro (768Wh)",
        "budgetPickClass": "Lightweight Mobile Backup",
        "budgetPickAsin": "B0B9XQ5G7B",
        "budgetPickReason": "70-minute charge time and lightweight 17 lb footprint for rapid apartment emergency deployment."
    },

    # 加利福尼亚州（野火防灾主动拉闸限电 PSPS）
    {
        "slug": "california-los-angeles",
        "cityName": "Los Angeles",
        "stateName": "California",
        "stateCode": "CA",
        "primaryThreat": "Santa Ana Wildfire PSPS Shutoffs & Earthquakes",
        "riskType": "Wildfire / PSPS",
        "riskLevel": "High During Fire Season",
        "recommendedCapacity": "1000Wh - 2000Wh",
        "localAnalysis": "Utility companies initiate Public Safety Power Shutoffs (PSPS) during dry, high-wind Santa Ana events to prevent sparks, leaving residents without power for 24-48 hours.",
        "topPickName": "Anker SOLIX F2000 (2048Wh)",
        "topPickClass": "Zero-Emission Apartment Safe Unit",
        "topPickAsin": "B0BX9T1K94",
        "topPickReason": "100% legal for apartment balconies where gas-powered generators are strictly banned by city fire codes.",
        "budgetPickName": "Jackery Explorer 1000 v2 (1070Wh)",
        "budgetPickClass": "Solar Camping & Emergency",
        "budgetPickAsin": "B0D1GBG6Y5",
        "budgetPickReason": "Integrates effortlessly with 200W solar panels to recharge during bright California sunshine."
    }
]

# 确保输出目录存在
output_dir = os.path.join(os.path.dirname(__file__), "src", "data")
os.makedirs(output_dir, exist_ok=True)

# 写入 JSON 文件
output_path = os.path.join(output_dir, "cities.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(cities, f, indent=2, ensure_ascii=False)

print(f"成功生成 {len(cities)} 个高风险城市数据至: {output_path}")