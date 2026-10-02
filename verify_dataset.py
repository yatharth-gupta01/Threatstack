import csv
from collections import defaultdict

ALERTS_PATH = "data/generated/alerts.csv"
GT_PATH     = "data/generated/ground_truth.csv"

# ─── Load alerts.csv ─────────────────────────────────────────────────────────
alerts = {}          # alert_id -> row
planted_ids = set()  # alert_ids that have a mitre_id

with open(ALERTS_PATH, newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        alerts[row["alert_id"]] = row
        if row["mitre_id"].strip():
            planted_ids.add(row["alert_id"])

# ─── Load ground_truth.csv ───────────────────────────────────────────────────
gt_rows = []
inc_to_alerts = defaultdict(list)

with open(GT_PATH, newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        gt_rows.append(row)
        inc_to_alerts[row["incident_id"]].append(row["alert_id"])

# ─── CHECK 1: No duplicate alert_ids in alerts.csv ───────────────────────────
print("=" * 65)
print("CHECK 1: Duplicate alert_ids in alerts.csv")
seen = {}
dupes = []
with open(ALERTS_PATH, newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        aid = row["alert_id"]
        if aid in seen:
            dupes.append(aid)
        seen[aid] = True

if dupes:
    print(f"  FAIL  - {len(dupes)} duplicates found: {dupes[:5]}")
else:
    print(f"  PASS  - All {len(alerts)} alert_ids are unique.")

# ─── CHECK 2: Every GT alert_id exists in alerts.csv ────────────────────────
print("\nCHECK 2: Every ground_truth alert_id exists in alerts.csv")
missing = [r["alert_id"] for r in gt_rows if r["alert_id"] not in alerts]
if missing:
    print(f"  FAIL  - {len(missing)} alert_ids in ground_truth NOT found in alerts: {missing[:5]}")
else:
    print(f"  PASS  - All {len(gt_rows)} ground_truth rows resolve to valid alert_ids.")

# ─── CHECK 3: Benign vs planted ratio ────────────────────────────────────────
print("\nCHECK 3: Benign vs Planted ratio")
total    = len(alerts)
planted  = len(planted_ids)
benign   = total - planted
ratio    = benign / planted if planted else float("inf")
print(f"  Total rows    : {total}")
print(f"  Benign rows   : {benign}")
print(f"  Planted rows  : {planted}")
print(f"  Ratio (B:P)   : {ratio:.1f}:1")

# ─── CHECK 4: Alerts per planted incident ────────────────────────────────────
print("\nCHECK 4: Alert count per planted incident")
for inc_id in sorted(inc_to_alerts.keys()):
    count = len(inc_to_alerts[inc_id])
    # grab mitre_id from first alert in incident
    first_aid = inc_to_alerts[inc_id][0]
    mitre = alerts[first_aid]["mitre_id"]
    atype = alerts[first_aid]["alert_type"]
    print(f"  {inc_id}  |  {count:>3} alerts  |  {mitre:<12}  |  {atype}")

# ─── CHECK 5: One full example row per incident ────────────────────────────────
print("\nCHECK 5: One full example row per planted incident")
for inc_id in sorted(inc_to_alerts.keys()):
    first_aid = inc_to_alerts[inc_id][0]
    row = alerts[first_aid]
    print(f"\n  --- {inc_id} ---")
    for k, v in row.items():
        val = v if len(v) <= 120 else v[:117] + "..."
        print(f"    {k:<14}: {val}")

print("\n" + "=" * 65)
print("All checks complete.")
