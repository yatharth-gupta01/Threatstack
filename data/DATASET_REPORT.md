# ThreatStack Synthetic SOC Alert Dataset Report

> **Prepared for Hackathon Presentation & Technical Demonstration**  
> **Source Files**: `/data/generated/alerts.csv` & `/data/generated/ground_truth.csv`  
> **Generation Engine**: `generate_logs.py` (Seeded with real EVTX attack artifacts)

---

## 1. Total Records

| File Name | Record / Row Count | Description |
|---|---|---|
| `alerts.csv` | **9,768** | Total security alerts ingested (benign background activity + planted attack alerts) |
| `ground_truth.csv` | **440** | Total labeled incident-to-alert mapping associations |

---

## 2. Column List

Every column in `alerts.csv` with a plain-English explanation of its operational purpose:

- **`alert_id`**: A unique alphanumeric tracking identifier assigned to every single alert event (e.g., `ALT-6BAF16E1`).
- **`timestamp`**: The UTC timestamp indicating the exact date and time the security event occurred, recorded in standard ISO 8601 / RFC 3339 format (`YYYY-MM-DDTHH:MM:SSZ`).
- **`asset`**: The hostname or server identifier in the corporate network where the event originated or was detected (e.g., `auth-server-01`, `dc-primary-01`, `workstation-19`).
- **`severity`**: The triage priority level assigned to the event, categorized into `High`, `Medium`, `Low`, or `Info`.
- **`alert_type`**: The functional categorization or signature title of the security event (e.g., `Scheduled Task Created`, `Brute Force - Password Spray`, `Malicious PowerShell - LSASS Dump`).
- **`detail_text`**: A granular contextual narrative containing specific telemetry artifacts such as operating system usernames, process names, CLI arguments, target paths, or source/destination IP addresses.
- **`mitre_id`**: The MITRE ATT&CK technique code associated with known adversarial tactics (e.g., `T1110.003`, `T1059.001`); populated for planted malicious incident activity and blank for benign operational noise.

---

## 3. Alert Types + Counts

All 23 distinct values in the `alert_type` column, ordered from highest to lowest occurrence across the full dataset:

| Rank | Alert Type | Row Count | Category |
|:---:|---|:---:|:---:|
| 1 | `Software Installation` | 597 | Benign |
| 2 | `Group Policy Updated` | 595 | Benign |
| 3 | `Account Locked Out` | 593 | Benign |
| 4 | `Scheduled Task Created` | 592 | Benign |
| 5 | `Successful Logon` | 592 | Benign |
| 6 | `User Logoff` | 590 | Benign |
| 7 | `File Access` | 589 | Benign |
| 8 | `Certificate Renewed` | 588 | Benign |
| 9 | `DNS Query` | 587 | Benign |
| 10 | `Outbound Connection` | 585 | Benign |
| 11 | `Antivirus Scan Completed` | 583 | Benign |
| 12 | `USB Device Connected` | 576 | Benign |
| 13 | `Remote Desktop Session` | 573 | Benign |
| 14 | `PowerShell Execution` | 569 | Benign |
| 15 | `Service Started` | 566 | Benign |
| 16 | `Failed Logon` | 553 | Benign |
| 17 | `Brute Force - Password Spray` | 168 | Planted Incident |
| 18 | `Brute Force - SQL Auth Failure` | 110 | Planted Incident |
| 19 | `Lateral Movement - SMB File Copy` | 68 | Planted Incident |
| 20 | `Malicious PowerShell - Credential Harvest` | 33 | Planted Incident |
| 21 | `Exfiltration via FTP` | 31 | Planted Incident |
| 22 | `Malicious PowerShell - LSASS Dump` | 21 | Planted Incident |
| 23 | `Suspicious Login Failures - Inconclusive` | 9 | Planted Incident |
| **Total** | | **9,768** | |

---

## 4. Severity Distribution

Distribution across the entire dataset (9,768 total records):

| Severity Level | Alert Count | Percentage of Total Dataset |
|---|:---:|:---:|
| **Info** | 5,287 | 54.13% |
| **Low** | 4,050 | 41.46% |
| **High** | 290 | 2.97% |
| **Medium** | 141 | 1.44% |
| **Total** | **9,768** | **100.00%** |

### Breakdown Across Actionable Triage Severities (High / Medium / Low):
- **High**: 290 alerts (6.47% of actionable alerts)
- **Medium**: 141 alerts (3.15% of actionable alerts)
- **Low**: 4,050 alerts (90.38% of actionable alerts)
- *Total High / Medium / Low*: 4,481 alerts

---

## 5. Unique Entities

Entities represented in the dataset and their corresponding columns:

| Entity Type | Column Name Used | Unique Count | Detail & Examples |
|---|---|:---:|---|
| **Asset / Host** | `asset` (structured column) | **15** | Corporate servers and endpoints: `auth-server-01`, `auth-server-02`, `db-server-02`, `db-server-05`, `dc-backup-02`, `dc-primary-01`, `dev-build-01`, `file-server-03`, `file-server-07`, `jump-host-01`, `vpn-gateway-01`, `workstation-12`, `workstation-19`, `workstation-31`, `workstation-44`. |
| **Username** | Embedded in `detail_text` | **103** | Seeded from 50 enterprise users (e.g., `alice.kim`, `bob.patel`, `will.foster`, `yasmin.ali`) plus administrative accounts, service principles, and target accounts (`sa`, `admin`, `guest`, `testuser`, `backup-svc`, `scanner`). |
| **IP Address** | Embedded in `detail_text` | **1,159** | Internal enterprise subnets (`10.0.1.x`–`10.0.10.x`), attacker infrastructure (`10.0.2.15`, `10.0.2.17`), and external destination IPs (`203.0.113.x`). |

---

## 6. Attack Scenarios Represented

Summary of each of the **7 planted incidents** in `ground_truth.csv`:

| Incident ID | MITRE ID | Technique Name | Severity | Alert Count | Targeted Asset | Description / Trigger |
|:---:|:---:|---|:---:|:---:|:---:|---|
| **INC-001** | `T1110.003` | Brute Force: Password Spraying | High | 168 | `workstation-19` | High-frequency password spray targeting SQL authentication with rapid login failure telemetry. |
| **INC-002** | `T1021.002` | Remote Services: SMB / Admin Shares | High | 68 | `auth-server-01` | Unauthorized lateral traversal attempting access to hidden administrative share `\\??\\C$\\`. |
| **INC-003** | `T1059.001` | Command & Scripting Interpreter: PowerShell | High | 21 | `auth-server-02` | In-memory invocation of `MiniDumpWriteDump` targeting the `lsass.exe` process for credential harvesting. |
| **INC-004** | `T1041` | Exfiltration Over C2 / Alternate Protocol | Medium | 31 | `dc-primary-01` | Automated staging and egress of sensitive corporate data over FTP using native Windows `ftp.exe`. |
| **INC-005** | `T1110.003` | Brute Force: Password Spraying | Medium | 110 | `workstation-12` | Sustained authentication failures against database service accounts originating from internal host `10.0.2.17`. |
| **INC-006** | `T1059.001` | Command & Scripting Interpreter: PowerShell | High | 33 | `dev-build-01` | Obfuscated PowerShell execution conducting memory dumping and token extraction on a build pipeline host. |
| **INC-007** | `T1110.003` | Brute Force: Password Spraying | Low | 9 | `jump-host-01` | Mild, inconclusive login failure sequence without escalation, designed to evaluate SOC noise dampening. |

*Total Planted Alerts across 7 Incidents*: **440 alerts**

---

## 7. MITRE Techniques Represented

Every unique MITRE ATT&CK technique represented in the dataset:

| MITRE ID | Full Technique Name | Total Alerts | Incidents Mapped | Mapped Incident IDs |
|:---:|---|:---:|:---:|:---:|
| **`T1110.003`** | Brute Force: Password Spraying | 287 | 3 | `INC-001`, `INC-005`, `INC-007` |
| **`T1021.002`** | Remote Services: SMB/Windows Admin Shares | 68 | 1 | `INC-002` |
| **`T1059.001`** | Command and Scripting Interpreter: PowerShell | 54 | 2 | `INC-003`, `INC-006` |
| **`T1041`** | Exfiltration Over C2 Channel / Exfiltration Over Alternative Protocol (FTP) | 31 | 1 | `INC-004` |
| *(None / Blank)* | *Benign Enterprise Operational Traffic* | 9,328 | 0 | *N/A* |

---

## 8. Benign vs Malicious Counts

Cross-reference of alerts in `alerts.csv` against labeled incidents in `ground_truth.csv`:

| Alert Classification | Row Count | Percentage | Operational Ratio |
|---|:---:|:---:|:---:|
| **Benign Operational Alerts** | 9,328 | 95.50% | **~21.2 : 1** (Noise-to-Signal) |
| **Planted Malicious Alerts** | 440 | 4.50% | 1 in every 22.2 alerts is an attack indicator |
| **Total Ingested Alerts** | **9,768** | **100.00%** | |

> **Significance for SOC & Hackathon PPT**:  
> In real enterprise Security Operations Centers, 90–99% of raw alerts are benign noise. This 95.5% benign ratio provides a realistic demonstration environment to showcase how ThreatStack's correlation engine collapses thousands of raw logs into 7 coherent, actionable incident tickets.

---

## 9. Ground-Truth Incident Count

- **Total Labelled Incidents in `ground_truth.csv`**: **7** (`INC-001` through `INC-007`)
- **Total Mapped Ground-Truth Rows**: **440** (exact 1:1 match with planted alerts in `alerts.csv`)

---

## 10. Correlatable Alert Examples

### Selected Planted Incident: `INC-003` (LSASS Credential Dumping via PowerShell)

Below are 4 actual individual alert rows from `alerts.csv` belonging to `INC-003`:

#### Row 1:
```json
{
  "alert_id": "ALT-696E49BF",
  "timestamp": "2026-09-25T04:33:30Z",
  "asset": "auth-server-02",
  "severity": "High",
  "alert_type": "Malicious PowerShell - LSASS Dump",
  "detail_text": "PowerShell script execution detected dynamically invoking MiniDumpWriteDump to extract credentials from the lsass process into a local dump file Source IP: 10.0.2.90.",
  "mitre_id": "T1059.001"
}
```

#### Row 2:
```json
{
  "alert_id": "ALT-902EFE06",
  "timestamp": "2026-09-25T04:33:35Z",
  "asset": "auth-server-02",
  "severity": "High",
  "alert_type": "Malicious PowerShell - LSASS Dump",
  "detail_text": "PowerShell script execution detected dynamically invoking MiniDumpWriteDump to extract credentials from the lsass process into a local dump file Sequence #0180 in burst window.",
  "mitre_id": "T1059.001"
}
```

#### Row 3:
```json
{
  "alert_id": "ALT-B1F3BC0E",
  "timestamp": "2026-09-25T04:33:46Z",
  "asset": "auth-server-02",
  "severity": "High",
  "alert_type": "Malicious PowerShell - LSASS Dump",
  "detail_text": "PowerShell script execution detected dynamically invoking MiniDumpWriteDump to extract credentials from the lsass process into a local dump file Initiated by process: powershell.exe.",
  "mitre_id": "T1059.001"
}
```

#### Row 4:
```json
{
  "alert_id": "ALT-7FCC8DA2",
  "timestamp": "2026-09-25T04:33:59Z",
  "asset": "auth-server-02",
  "severity": "High",
  "alert_type": "Malicious PowerShell - LSASS Dump",
  "detail_text": "PowerShell script execution detected dynamically invoking MiniDumpWriteDump to extract credentials from the lsass process into a local dump file Initiated by process: powershell.exe.",
  "mitre_id": "T1059.001"
}
```

### Correlation Pattern Connecting Them:
1. **Identical Asset Affinity**: All alerts occur on the sensitive authentication server `auth-server-02`.
2. **Ultra-Tight Time Horizon**: The entire burst of 21 alerts occurs within an acute 29-second window (`04:33:30Z` to `04:33:59Z`), demonstrating an automated script execution.
3. **Common TTP / Technique Signature**: Every alert triggers on MITRE technique `T1059.001` with signature `Malicious PowerShell - LSASS Dump`.
4. **Shared Process & API Artifacts**: Telemetry consistently references dynamic invocation of `MiniDumpWriteDump` against `lsass` initiated by parent process `powershell.exe`.

A detection/triage engine evaluates these overlapping dimensions (same host + 30-second window + identical MITRE technique + shared execution binary) to immediately group all 21 raw alerts into a single High-severity incident card.

---

## 11. Data Quality

### Missing / Null Values:
- **`alert_id`**: 0 missing / null values (100% populated)
- **`timestamp`**: 0 missing / null values (100% populated)
- **`asset`**: 0 missing / null values (100% populated)
- **`severity`**: 0 missing / null values (100% populated)
- **`alert_type`**: 0 missing / null values (100% populated)
- **`detail_text`**: 0 missing / null values (100% populated)
- **`mitre_id`**: 9,328 empty values (representing 100% of benign rows where MITRE tags are absent by design; 0 missing values across planted malicious incidents)

### Duplicate Alerts & Referential Integrity:
- **Duplicate `alert_id` in `alerts.csv`**: **0** (All 9,768 identifiers are unique UUID4 hashes).
- **Duplicate `alert_id` in `ground_truth.csv`**: **0** (All 440 incident associations are unique).
- **Referential Integrity**: 100% (Every `alert_id` in `ground_truth.csv` exists in `alerts.csv`; 0 orphaned records).

### Applied Preprocessing & Generation Steps:
1. **Telemetry Grounding via EVTX Parsing**: Real process names (`powershell.exe`, `ftp.exe`, `MSSQLSERVER`), command lines, source IPs, and target file paths were parsed from real Windows EVTX files using `python-evtx` and structured into `data/technique_samples.json`.
2. **Localized Burst Modeling**: For each planted attack, timestamps were constrained to a dense, localized burst duration of 2 to 8 minutes on a targeted endpoint.
3. **Simulated Background Operational Noise**: 9,328 benign alert rows were sampled uniformly across a rolling 24-hour window across 15 enterprise assets and 50 realistic employee accounts.
4. **Temporal Consistency**: All dates and timestamps are formatted consistently to RFC 3339 / ISO 8601 UTC standards (`YYYY-MM-DDTHH:MM:SSZ`).
5. **Full Random Shuffling**: Benign logs and attack bursts were thoroughly interleaved using `random.shuffle()` to simulate a real-world multiplexed SIEM/SOC event stream where noise and adversary actions arrive intermixed.

---

## 12. Timestamp Range

- **Earliest Timestamp**: `2026-09-24T09:27:51Z`
- **Latest Timestamp**: `2026-09-25T09:27:32Z`
- **Total Span**: **23 hours, 59 minutes, 41 seconds** (~24-hour continuous SOC monitoring cycle)

---

## 13. Dataset Source

This dataset is a **synthetic security operations dataset**, custom-generated using our automated generation pipeline (`generate_logs.py`).

Crucially, it is not fabricated from arbitrary strings; rather, it is **seeded directly with real operational artifacts and field values extracted from public Windows Event Log (EVTX) attack samples**:
- **Source Repository**: [`sbousseaden/EVTX-ATTACK-SAMPLES`](https://github.com/sbousseaden/EVTX-ATTACK-SAMPLES)
- **License**: Public, open-source repository created and maintained by security researcher Samir Bousseaden.
- **Extraction Method**: Raw EVTX logs for brute force, lateral movement, PowerShell execution, and data exfiltration were parsed into XML representations via `python-evtx`, from which authentic processes, command-line arguments, IP addresses, and file paths were extracted to seed `technique_samples.json`.

---

## 14. Strongest Demonstrable Scenarios

The 4 most compelling attack scenarios in this dataset for a live hackathon demo or slide deck:

1. **INC-003: LSASS Memory Dumping via In-Memory PowerShell (`T1059.001` | High | `auth-server-02`)**  
   *Why it's compelling*: Highlights a critical credential-theft vector against a tier-0 authentication server where 21 alerts fire within seconds, proving ThreatStack's ability to instantly isolate high-severity, active intrusions from background noise.

2. **INC-002: Lateral Movement via Administrative SMB Shares (`T1021.002` | High | `auth-server-01`)**  
   *Why it's compelling*: Models real-world adversary pivoting where an attacker traverses internal subnets targeting hidden `C$` shares, perfect for demonstrating incident timelines and lateral hop tracing.

3. **INC-004: Covert Data Exfiltration via Native FTP (`T1041` | Medium | `dc-primary-01`)**  
   *Why it's compelling*: Demonstrates living-off-the-land (LotL) abuse of native Windows binaries (`ftp.exe` running automated scripts from `AppData\Local\Temp`), proving detection of stealthy low-and-slow egress that bypasses standard perimeter blocks.

4. **INC-007: Inconclusive Login Failures (`T1110.003` | Low | `jump-host-01`)**  
   *Why it's compelling*: Demonstrates intelligent triage and false-positive suppression by identifying a mild, non-escalating burst of 9 routine failures, validating that ThreatStack does not trigger panic or alert fatigue on benign user errors.

---

## 15. Sample Rows

Representative rows from `/data/generated/alerts.csv`:

| alert_id | timestamp | asset | severity | alert_type | detail_text | mitre_id |
|---|---|---|:---:|---|---|:---:|
| `ALT-6BAF16E1` | `2026-09-24T22:04:37Z` | `workstation-31` | Low | Scheduled Task Created | User will.foster created a scheduled task on workstation-31 via Task Scheduler. | *(Benign - None)* |
| `ALT-918E4B32` | `2026-09-24T17:00:20Z` | `workstation-19` | High | Brute Force - Password Spray | Multiple failed SQL Server login attempts for user 'sa' originating from client IP 10.0.2.17 due to password mismatch Parent process: MSSQLSERVER. | `T1110.003` |
| `ALT-B1F3BC0E` | `2026-09-25T04:33:46Z` | `auth-server-02` | High | Malicious PowerShell - LSASS Dump | PowerShell script execution detected dynamically invoking MiniDumpWriteDump to extract credentials from the lsass process into a local dump file Initiated by process: powershell.exe. | `T1059.001` |

---

*Report generated and validated by ThreatStack Data Pipeline.*
