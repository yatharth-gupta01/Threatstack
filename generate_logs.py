import json
import csv
import random
import uuid
import os
from datetime import datetime, timedelta, timezone

# ─── Config ────────────────────────────────────────────────────────────────────
BENIGN_COUNT      = random.randint(9000, 10000)
PLANTED_INCIDENTS = 7
OUTPUT_DIR        = os.path.join("data", "generated")
TECHNIQUE_FILE    = os.path.join("data", "technique_samples.json")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ─── Load real technique samples ───────────────────────────────────────────────
with open(TECHNIQUE_FILE, "r") as f:
    TECHNIQUES = json.load(f)

# ─── User / Asset pools ────────────────────────────────────────────────────────
USERS = [
    "alice.kim", "bob.patel", "carol.jones", "dan.wright", "eve.chen",
    "frank.müller", "grace.lee", "hiro.nakamura", "irene.garcia", "james.okonkwo",
    "kate.novak", "liam.foster", "mia.santos", "noah.chang", "olivia.reed",
    "peter.walsh", "quinn.adams", "rachel.berg", "sam.taylor", "tara.ito",
    "umar.hassan", "vicky.stone", "will.foster", "xiu.lin", "yasmin.ali",
    "zach.brown", "anna.ivanova", "ben.ohara", "claire.dubois", "derek.smith",
    "elena.volkov", "felix.ramos", "gina.marchetti", "henry.owens", "iris.ng",
    "jack.morgan", "karen.elliot", "leo.fernandez", "mary.bell", "nick.santos",
    "omar.diallo", "priya.sharma", "ryan.kowalski", "sara.jensen", "tom.mueller",
    "uma.krishnan", "victor.sousa", "wendy.park", "xavier.martin", "yuki.tanaka",
]

ASSETS = [
    "auth-server-01", "auth-server-02",
    "workstation-12", "workstation-19", "workstation-31", "workstation-44",
    "file-server-03", "file-server-07",
    "db-server-02", "db-server-05",
    "vpn-gateway-01",
    "dc-primary-01", "dc-backup-02",
    "dev-build-01",
    "jump-host-01",
]

# ─── Benign alert templates ─────────────────────────────────────────────────────
BENIGN_ALERTS = [
    ("Low",  "Scheduled Task Created",   lambda u, a: f"User {u} created a scheduled task on {a} via Task Scheduler."),
    ("Info", "Successful Logon",         lambda u, a: f"User {u} successfully authenticated to {a} from 10.0.{random.randint(1,10)}.{random.randint(1,254)}."),
    ("Info", "Software Installation",    lambda u, a: f"User {u} installed software package on {a}."),
    ("Low",  "Failed Logon",             lambda u, a: f"User {u} failed to authenticate on {a}: invalid password (attempt {random.randint(1,3)}/3)."),
    ("Info", "File Access",              lambda u, a: f"User {u} accessed shared folder \\\\{a}\\Data at {random.randint(9,17)}:{random.randint(0,59):02d}."),
    ("Info", "Group Policy Updated",     lambda u, a: f"Group Policy refreshed on {a} for user {u}."),
    ("Low",  "USB Device Connected",     lambda u, a: f"Removable media connected to {a} by user {u}."),
    ("Info", "Service Started",          lambda u, a: f"Windows service 'Spooler' restarted on {a}."),
    ("Low",  "Account Locked Out",       lambda u, a: f"Account for {u} was temporarily locked out on {a} after repeated failed logins."),
    ("Info", "DNS Query",                lambda u, a: f"DNS lookup for internal.corp-domain.net from {a} by process svchost.exe."),
    ("Info", "Antivirus Scan Completed", lambda u, a: f"AV scan completed on {a}. No threats detected."),
    ("Low",  "Outbound Connection",      lambda u, a: f"Outbound connection from {a} to 203.0.113.{random.randint(1,254)}:443 by process chrome.exe."),
    ("Info", "User Logoff",              lambda u, a: f"User {u} logged off from {a}."),
    ("Low",  "PowerShell Execution",     lambda u, a: f"PowerShell script executed on {a} by {u}: Get-ChildItem C:\\Users -Recurse."),
    ("Info", "Certificate Renewed",      lambda u, a: f"TLS certificate renewed for service on {a}."),
    ("Low",  "Remote Desktop Session",   lambda u, a: f"RDP session opened on {a} by {u} from 10.0.{random.randint(1,5)}.{random.randint(1,254)}."),
]

# ─── Incident definitions ───────────────────────────────────────────────────────
# Map each of the 7 incidents to a technique and severity
INCIDENT_DEFINITIONS = [
    {"mitre_id": "T1110.003", "severity": "High",   "alert_type": "Brute Force - Password Spray",
     "alert_count": random.randint(120, 250)},
    {"mitre_id": "T1021.002", "severity": "High",   "alert_type": "Lateral Movement - SMB File Copy",
     "alert_count": random.randint(40, 100)},
    {"mitre_id": "T1059.001", "severity": "High",   "alert_type": "Malicious PowerShell - LSASS Dump",
     "alert_count": random.randint(20, 60)},
    {"mitre_id": "T1041",     "severity": "Medium", "alert_type": "Exfiltration via FTP",
     "alert_count": random.randint(30, 80)},
    {"mitre_id": "T1110.003", "severity": "Medium", "alert_type": "Brute Force - SQL Auth Failure",
     "alert_count": random.randint(60, 150)},
    {"mitre_id": "T1059.001", "severity": "High",   "alert_type": "Malicious PowerShell - Credential Harvest",
     "alert_count": random.randint(20, 50)},
    # INC-007: deliberate Low-severity, inconclusive login failures - no escalation
    {"mitre_id": "T1110.003", "severity": "Low",    "alert_type": "Suspicious Login Failures - Inconclusive",
     "alert_count": random.randint(5, 10), "mild": True},
]

# ─── Helpers ────────────────────────────────────────────────────────────────────
NOW = datetime.now(timezone.utc)

def rand_ts_last_24h():
    """Random timestamp in the last 24 hours."""
    offset = random.uniform(0, 86400)
    return (NOW - timedelta(seconds=offset)).strftime("%Y-%m-%dT%H:%M:%SZ")

def make_alert_id():
    return f"ALT-{uuid.uuid4().hex[:8].upper()}"

def incident_detail(mitre_id, process_variation=0):
    """Build an authentic detail string from the technique_samples.json."""
    t = TECHNIQUES.get(mitre_id, {})
    proc = t.get("process", "unknown.exe")
    cmd  = t.get("command_line", "N/A")
    base = t.get("detail_text", "Suspicious activity detected.")
    src  = t.get("source_ip", f"10.0.{random.randint(1,10)}.{random.randint(1,254)}")
    fpath= t.get("file_path", "")

    # Add slight variation per alert row so rows aren't identical
    suffixes = [
        f" Source IP: {src}.",
        f" Initiated by process: {proc}.",
        f" CommandLine captured: {cmd[:80]}..." if len(cmd) > 80 else f" CommandLine: {cmd}.",
        f" Target path: {fpath}." if fpath else "",
        f" Sequence #{random.randint(1, 999):04d} in burst window.",
        f" Parent process: {proc}.",
    ]
    return base.rstrip(".") + " " + random.choice([s for s in suffixes if s]).strip()


_MILD_USERS = ["guest", "admin", "testuser", "backup-svc", "scanner"]
_MILD_ASSETS_POOL = ["auth-server-01", "auth-server-02", "jump-host-01"]

def mild_logon_detail(asset):
    """Gentle, inconclusive failed-login detail for INC-007 (Low severity).
    No escalation, no lateral movement, login never succeeded.
    """
    user   = random.choice(_MILD_USERS)
    src_ip = f"10.0.{random.randint(1,10)}.{random.randint(1,254)}"
    attempt = random.randint(1, 3)
    phrases = [
        f"Logon failure for account '{user}' on {asset} from {src_ip} "
        f"(attempt {attempt}/3). No subsequent successful logon observed.",
        f"Authentication attempt by '{user}' from {src_ip} failed on {asset}: "
        f"incorrect password. Activity did not escalate.",
        f"Single failed logon for '{user}' on {asset} originating from {src_ip}. "
        f"No pattern or follow-up access detected.",
        f"Low-confidence logon failure: '{user}' on {asset} from {src_ip}. "
        f"Could be a misconfigured service account or manual typo.",
        f"Isolated failed login for '{user}' at {src_ip} targeting {asset}. "
        f"No successful authentication, no follow-on activity.",
    ]
    return random.choice(phrases)

# ─── Generate benign rows ───────────────────────────────────────────────────────
print(f"Generating {BENIGN_COUNT} benign alert rows...")
benign_rows = []
for _ in range(BENIGN_COUNT):
    user   = random.choice(USERS)
    asset  = random.choice(ASSETS)
    tmpl   = random.choice(BENIGN_ALERTS)
    sev, atype, detail_fn = tmpl
    benign_rows.append({
        "alert_id":   make_alert_id(),
        "timestamp":  rand_ts_last_24h(),
        "asset":      asset,
        "severity":   sev,
        "alert_type": atype,
        "detail_text": detail_fn(user, asset),
        "mitre_id":   "",
    })

# ─── Generate planted incident rows ────────────────────────────────────────────
print(f"Generating {PLANTED_INCIDENTS} planted incidents...")
planted_rows = []
ground_truth = []  # list of {incident_id, alert_id}

# Pick distinct assets for the first 6 incidents; INC-007 picks from auth/jump assets
incident_assets = random.sample(ASSETS, k=PLANTED_INCIDENTS - 1) + [random.choice(_MILD_ASSETS_POOL)]

for idx, inc_def in enumerate(INCIDENT_DEFINITIONS):
    incident_id  = f"INC-{idx+1:03d}"
    mitre_id     = inc_def["mitre_id"]
    severity     = inc_def["severity"]
    alert_type   = inc_def["alert_type"]
    alert_count  = inc_def["alert_count"]
    asset        = incident_assets[idx]

    # Tight burst window: pick a random start in last 24h, span a few minutes
    burst_start_offset = random.uniform(300, 86000)  # at least 5 min from now
    burst_start = NOW - timedelta(seconds=burst_start_offset)
    burst_duration_secs = random.randint(120, 480)   # 2-8 minute burst

    print(f"  {incident_id}: {mitre_id} | {alert_count} alerts on {asset} "
          f"starting {burst_start.strftime('%H:%M:%S')} UTC")

    is_mild = inc_def.get("mild", False)

    for i in range(alert_count):
        ts_offset = random.uniform(0, burst_duration_secs)
        ts = (burst_start + timedelta(seconds=ts_offset)).strftime("%Y-%m-%dT%H:%M:%SZ")
        alert_id = make_alert_id()

        detail = mild_logon_detail(asset) if is_mild else incident_detail(mitre_id, i)

        row = {
            "alert_id":    alert_id,
            "timestamp":   ts,
            "asset":       asset,
            "severity":    severity,
            "alert_type":  alert_type,
            "detail_text": detail,
            "mitre_id":    mitre_id,
        }
        planted_rows.append(row)
        ground_truth.append({"incident_id": incident_id, "alert_id": alert_id})

# ─── Combine + shuffle ──────────────────────────────────────────────────────────
all_rows = benign_rows + planted_rows
random.shuffle(all_rows)

# ─── Write alerts.csv ───────────────────────────────────────────────────────────
alerts_path = os.path.join(OUTPUT_DIR, "alerts.csv")
fieldnames = ["alert_id", "timestamp", "asset", "severity", "alert_type", "detail_text", "mitre_id"]
with open(alerts_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(all_rows)
print(f"\nWrote {len(all_rows)} rows -> {alerts_path}")

# ─── Write ground_truth.csv ────────────────────────────────────────────────────
gt_path = os.path.join(OUTPUT_DIR, "ground_truth.csv")
with open(gt_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["incident_id", "alert_id"])
    writer.writeheader()
    writer.writerows(ground_truth)
print(f"Wrote {len(ground_truth)} ground-truth rows -> {gt_path}")

# ─── Summary ────────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print(f"  Total alert rows  : {len(all_rows)}")
print(f"  Benign rows       : {len(benign_rows)}")
print(f"  Planted rows      : {len(planted_rows)}")
print(f"  Planted incidents : {PLANTED_INCIDENTS}")
print("="*60)

# ─── Preview first 10 rows ─────────────────────────────────────────────────────
print("\nFirst 10 rows of alerts.csv:\n")
with open(alerts_path, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for i, row in enumerate(reader):
        if i >= 10:
            break
        detail_preview = row["detail_text"][:80] + "..." if len(row["detail_text"]) > 80 else row["detail_text"]
        print(f"  [{i+1}] {row['alert_id']} | {row['timestamp']} | {row['asset']:<22} "
              f"| {row['severity']:<6} | {row['alert_type']:<45} | {detail_preview}")
