import os
import re
import pandas as pd

base_dir = os.path.dirname(__file__)
input_file = os.path.join(base_dir, "data", "keywords.csv")
output_file = os.path.join(base_dir, "data", "keywords_cleaned.csv")

print(f"[*] 正在读取原始词库: {input_file}")

# 1. 自动探测编码与表头位置
df = None
encodings = ["utf-16", "utf-16-le", "utf-8-sig", "gbk", "utf-8"]

for enc in encodings:
    for sep in [None, "\t", ","]:
        try:
            temp_df = pd.read_csv(input_file, encoding=enc, sep=sep, engine="python")
            first_row_str = " ".join([str(x) for x in temp_df.columns])
            if any(k in first_row_str for k in ["Keyword", "关键字", "Avg.", "搜索量"]):
                df = temp_df
                print(f"[✓] 成功识别编码: {enc}")
                break
            
            second_row_str = " ".join([str(x) for x in temp_df.iloc[0].values])
            if any(k in second_row_str for k in ["Keyword", "关键字", "Avg.", "搜索量"]):
                df = pd.read_csv(input_file, encoding=enc, sep=sep, engine="python", skiprows=1)
                print(f"[✓] 成功跳过首行并识别编码: {enc}")
                break
        except Exception:
            continue
    if df is not None:
        break

if df is None:
    raise ValueError("[!] 无法解析该文件，请确认 keywords.csv 是否存在。")

df.columns = [str(c).strip() for c in df.columns]

# 2. 精准锁定核心列（优先找 Avg. monthly searches）
col_keyword = None
col_searches = None

for col in df.columns:
    c_lower = col.lower()
    if "keyword" in c_lower or "关键字" in c_lower:
        col_keyword = col
    elif "avg. monthly searches" in c_lower or "平均每月搜索量" in c_lower:
        col_searches = col

# 兜底保障：如果被截断，按原表第 1 列和第 3 列索引（WPS中A列和C列）
if not col_keyword:
    col_keyword = df.columns[0]
if not col_searches:
    # 找包含 search 或 搜索，但排除具体月份的列
    candidates = [c for c in df.columns if ("search" in c.lower() or "搜索" in c.lower()) and not any(m in c.lower() for m in ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec", "202"])]
    col_searches = candidates[0] if candidates else df.columns[2]

print(f"[*] 锁定关键词列: [{col_keyword}], 搜索量列: [{col_searches}]")

initial_count = len(df)
print(f"[*] 原始关键词总数: {initial_count}")

# 3. 数值清洗与过滤（月均搜索量 >= 50）
df = df.dropna(subset=[col_keyword])
df[col_searches] = pd.to_numeric(df[col_searches].astype(str).str.replace(",", "").str.strip(), errors="coerce").fillna(0)
df = df[df[col_searches] >= 50]

# 4. 商业过滤：剔除纯配件杂质，保留电站整机
accessory_pattern = r"solar panel|cable|adapter|inverter only|bracket|connector"
core_device_pattern = r"generator|station|battery|power|backup|kit"

mask_accessory = df[col_keyword].astype(str).str.contains(accessory_pattern, case=False, na=False)
mask_core = df[col_keyword].astype(str).str.contains(core_device_pattern, case=False, na=False)

trash_mask = mask_accessory & (~mask_core)
df = df[~trash_mask]

# 5. 意图分类打标
def classify_intent(kw):
    kw_lower = str(kw).lower()
    if any(k in kw_lower for k in [" vs ", " versus ", " or "]):
        return "Comparison_VS"
    scene_words = ["rv", "camping", "home", "outage", "hurricane", "winter", "fridge", "refrigerator", "cpap", "off grid", "emergency"]
    if any(k in kw_lower for k in scene_words):
        return "Scenario_PainPoint"
    brands = ["jackery", "ecoflow", "bluetti", "anker", "goal zero", "pecron"]
    if any(k in kw_lower for k in brands):
        return "Brand_Specific"
    if re.search(r"\d+\s*(w|watt|kwh|wh)", kw_lower):
        return "Spec_Wattage"
    return "General_Search"

df["Intent_Category"] = df[col_keyword].apply(classify_intent)

# 6. 按搜索量排序导出
df = df.sort_values(by=[col_searches], ascending=False)
df.to_csv(output_file, index=False, encoding="utf-8-sig")

final_count = len(df)
removed_count = initial_count - final_count

print("-" * 50)
print(f"[✓] 清洗完成！")
print(f"    - 原始词量: {initial_count}")
print(f"    - 过滤纯配件/极低搜: {removed_count}")
print(f"    - 提炼黄金词: {final_count}")
print("-" * 50)
print("[*] 商业意图分布:")
print(df["Intent_Category"].value_counts())
print("-" * 50)
print(f"[✓] 干净的词库已生成: {output_file}")