import os
import re
import pandas as pd

# 1. 自动定位词库
base_dir = os.path.dirname(__file__)
possible_paths = [
    os.path.join(base_dir, "data", "keywords_cleaned.csv"),
    os.path.join(base_dir, "..", "coloringpages", "data", "keywords_cleaned.csv"),
    os.path.join(base_dir, "keywords_cleaned.csv")
]

csv_path = None
for p in possible_paths:
    if os.path.exists(p):
        csv_path = p
        break

if not csv_path:
    raise FileNotFoundError("[!] 未找到 keywords_cleaned.csv 文件。")

print(f"[*] 成功定位词库文件: {csv_path}")

try:
    df = pd.read_csv(csv_path, encoding="utf-8-sig")
except Exception:
    df = pd.read_csv(csv_path, encoding="utf-8")

df.columns = [str(c).strip() for c in df.columns]
col_keyword = [c for c in df.columns if "keyword" in c.lower() or "关键字" in c.lower()][0]
col_searches = [c for c in df.columns if "avg" in c.lower() or "searches" in c.lower() or "搜索量" in c.lower()][0]

cpc_cols = [c for c in df.columns if "high" in c.lower() or "高位" in c.lower()]
col_cpc = cpc_cols[0] if cpc_cols else None

print(f"[*] 关键词列: [{col_keyword}] | 搜索量列: [{col_searches}]")

# 2. 搜索量过滤 (50 ~ 1,000 次/月)
df[col_searches] = pd.to_numeric(df[col_searches].astype(str).str.replace(",", ""), errors="coerce").fillna(0)
cond_search = (df[col_searches] >= 50) & (df[col_searches] <= 1000)

# 3. 词长过滤：>= 3 个单词 (放行型号词和三词精准长尾)
df["Word_Count"] = df[col_keyword].apply(lambda x: len(str(x).strip().split()))
cond_length = df["Word_Count"] >= 3

# 4. 商业意图过滤器：锁定型号、家电、场景或决策词
high_intent_patterns = (
    r"(\bvs\b|\bversus\b|\bbest\b|\breview\b|\bkit\b|"
    r"\bdelta\b|\bexplorer\b|\bac200\b|\bac180\b|\bsolix\b|\briver\b|\b2000w\b|\b1000w\b|"
    r"\bcpap\b|\bfridge\b|\brefrigerator\b|\brv\b|\bcamping\b|\boff grid\b|\bhome backup\b)"
)
cond_intent = df[col_keyword].astype(str).str.contains(high_intent_patterns, case=False, regex=True)

# 5. 综合筛选
golden_df = df[cond_search & cond_length & cond_intent].copy()

# 6. 按出价(商业价值)优先排序，其次按搜索量
if col_cpc:
    golden_df[col_cpc] = pd.to_numeric(
        golden_df[col_cpc].astype(str).str.replace(",", "").str.replace("¥", ""), 
        errors="coerce"
    ).fillna(0)
    golden_df = golden_df.sort_values(by=[col_cpc, col_searches], ascending=[False, False])
else:
    golden_df = golden_df.sort_values(by=[col_searches], ascending=False)

# 去重
golden_df = golden_df.drop_duplicates(subset=[col_keyword])

# 7. 取前 20 组黄金词
top_20 = golden_df.head(20).copy()

# 8. 导出数据
output_dir = os.path.dirname(csv_path)
output_csv = os.path.join(output_dir, "target_vs_keywords.csv")
output_json = os.path.join(output_dir, "target_vs_keywords.json")

top_20.to_csv(output_csv, index=False, encoding="utf-8-sig")
top_20.to_json(output_json, orient="records", indent=2, force_ascii=False)

# 9. 格式化输出
print("=" * 85)
print(f"🎯 黄金词筛选完成！共命中: {len(golden_df)} 个，精选前 {len(top_20)} 组黄金词:")
print("=" * 85)
print(f"{'序号':<4} | {'月搜索量':<8} | {'高位出价(¥)':<10} | {'词长':<4} | {'关键词 (Target Keyword)':<45}")
print("-" * 85)

for idx, (_, row) in enumerate(top_20.iterrows(), 1):
    kw = row[col_keyword]
    searches = int(row[col_searches])
    cpc = f"¥{row[col_cpc]:.2f}" if col_cpc else "N/A"
    words = row["Word_Count"]
    print(f"{idx:<4} | {searches:<8} | {cpc:<10} | {words:<4} | {kw:<45}")

print("=" * 85)
print(f"[✓] 已导出干净数据至:\n    - {output_csv}\n    - {output_json}")