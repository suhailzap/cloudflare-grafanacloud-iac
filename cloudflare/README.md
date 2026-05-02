# 🌩️ Cloudflare Workers + Grafana Cloud — IaC with Terraform

A production-ready Infrastructure as Code (IaC) setup for deploying **Cloudflare Workers** with **D1 Database**, **Grafana Cloud observability** (logs + traces), and full **OpenTelemetry** integration — all managed via Terraform.

---

## 📐 Architecture

\```
                        ┌─────────────────────────────────┐
                        │        Cloudflare Edge           │
                        │                                  │
   HTTP Request ───────▶│  Worker 1 (API Gateway)         │
                        │    ├── /health                   │
                        │    ├── /info                     │
                        │    └── /echo                     │
                        │                                  │
   HTTP Request ───────▶│  Worker 2 (D1 Handler)          │
                        │    ├── /health                   │
                        │    ├── /setup                    │
                        │    ├── /log                      │
                        │    ├── /logs                     │
                        │    └── /clear                    │
                        │         │                        │
                        │         ▼                        │
                        │    D1 Database (mybinding)       │
                        └────────────┬────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │         OTLP Export              │
                    │                                  │
                    ▼                                  ▼
            grafana-loging                    grafana-tracing
         (Grafana Cloud Loki)            (Grafana Cloud Tempo)
\```

---

## 📁 Project Structure

\```
cloudflare-grafanacloud-iac/
├── provider.tf       # Terraform + Cloudflare provider config
├── variables.tf      # Input variables (account_id, secrets)
├── d1.tf             # D1 database resource
├── worker.tf         # Worker 1 - API Gateway
├── worker2.tf        # Worker 2 - D1 Handler
├── worker.js         # Worker 1 JavaScript source
├── worker2.js        # Worker 2 JavaScript source
├── outputs.tf        # Output values after apply
└── .gitignore        # Excludes state files and secrets
\```

---

## ⚡ Workers

### Worker 1 — API Gateway

| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET | Worker info + available routes |
| `/health` | GET | Health check + CF region |
| `/info` | GET | Your IP, country, CF colo via httpbin |
| `/echo` | POST | Echo back headers + body |

### Worker 2 — D1 Database Handler

| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET | Worker info + available routes |
| `/health` | GET | Health check |
| `/setup` | GET | Create D1 table (run once first) |
| `/log` | GET | Log current request to D1 |
| `/logs` | GET | Fetch last 20 logged requests |
| `/clear` | DELETE | Delete all logs from D1 |

---

## 📊 Observability

| Feature | Provider | Destination |
|---------|----------|-------------|
| Logs | Grafana Cloud Loki | `grafana-loging` |
| Traces | Grafana Cloud Tempo | `grafana-tracing` |
| Sampling | 100% | logs + traces |
| Invocation logs | ✅ Enabled | persisted |

### Log Levels

| Level | When |
|-------|------|
| `console.info` | Normal request flow |
| `console.warn` | Wrong method, unknown route, empty results |
| `console.error` | D1 failures, upstream errors, unhandled exceptions |

---

## 🚀 Getting Started

### Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.0
- Cloudflare account with Workers + D1 enabled
- Grafana Cloud account with OTLP pipelines configured
- Cloudflare API token with `Workers Scripts` + `D1` permissions

### 1. Clone the repo

\```bash
git clone git@github.com:suhailzap/cloudflare-grafanacloud-iac.git
cd cloudflare-grafanacloud-iac
\```

### 2. Set environment variables

\```bash
export CLOUDFLARE_API_TOKEN="your_cloudflare_api_token"
export TF_VAR_grafana_otlp_auth_header="Authorization=Basic your_base64_token"
\```

### 3. Initialize Terraform

\```bash
terraform init
\```

### 4. Plan

\```bash
terraform plan
\```

### 5. Apply

\```bash
terraform apply
\```

### 6. Set up D1 table (first time only)

\```bash
curl https://bitter-flower-57f0.fayizaai7.workers.dev/setup
\```

---

## 🔄 Import Existing Resources

If you already have resources in Cloudflare, import them:

\```bash
# Import Worker
terraform import cloudflare_workers_script.worker <account_id>/<script_name>

# Import D1 Database
terraform import cloudflare_d1_database.mydb <account_id>/<database_id>
\```

---

## 🔐 Security

- ✅ API tokens stored as environment variables only — never in `.tf` files
- ✅ Terraform state excluded from git via `.gitignore`
- ✅ Sensitive variables marked as `sensitive = true` in Terraform
- ✅ GitHub push protection enabled to block accidental secret commits

---

## 📦 Terraform Resources

| Resource | Type | Description |
|----------|------|-------------|
| `cloudflare_workers_script.worker` | Worker | API Gateway (Worker 1) |
| `cloudflare_workers_script.worker2` | Worker | D1 Handler (Worker 2) |
| `cloudflare_d1_database.mydb` | D1 | Shared database for Worker 2 |

---

## 🛠️ Useful Commands

\```bash
# Validate config
terraform validate

# Format all tf files
terraform fmt

# Show current state
terraform show

# Destroy all resources
terraform destroy
\```

---

## 📝 Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token |
| `TF_VAR_grafana_otlp_auth_header` | Grafana OTLP Basic auth header |

---

