🌩️ Cloudflare Workers + Grafana Cloud — IaC with Terraform
A production-ready Infrastructure as Code (IaC) setup for deploying Cloudflare Workers with D1 Database, Grafana Cloud observability (logs + traces), and full OpenTelemetry integration — all managed via Terraform.

📐 Architecture
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

📁 Project Structure
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

⚡ Workers
Worker 1 — API Gateway
RouteMethodDescription/GETWorker info + available routes/healthGETHealth check + CF region/infoGETYour IP, country, CF colo via httpbin/echoPOSTEcho back headers + body
Worker 2 — D1 Database Handler
RouteMethodDescription/GETWorker info + available routes/healthGETHealth check/setupGETCreate D1 table (run once first)/logGETLog current request to D1/logsGETFetch last 20 logged requests/clearDELETEDelete all logs from D1

📊 Observability
FeatureProviderDestinationLogsGrafana Cloud Lokigrafana-logingTracesGrafana Cloud Tempografana-tracingSampling100%logs + tracesInvocation logs✅ Enabledpersisted
Log levels used across workers:
LevelWhenconsole.infoNormal request flowconsole.warnWrong method, unknown route, empty resultsconsole.errorD1 failures, upstream errors, unhandled exceptions

🚀 Getting Started
Prerequisites

Terraform >= 1.0
Cloudflare account with Workers + D1 enabled
Grafana Cloud account with OTLP pipelines configured
Cloudflare API token with Workers Scripts + D1 permissions

1. Clone the repo
bashgit clone git@github.com:suhailzap/cloudflare-grafanacloud-iac.git
cd cloudflare-grafanacloud-iac
2. Set environment variables
bashexport CLOUDFLARE_API_TOKEN="your_cloudflare_api_token"
export TF_VAR_grafana_otlp_auth_header="Authorization=Basic your_base64_token"
3. Initialize Terraform
bashterraform init
4. Plan
bashterraform plan
5. Apply
bashterraform apply
6. Set up D1 table (first time only)
bashcurl https://bitter-flower-57f0.fayizaai7.workers.dev/setup

🔄 Import existing resources
If you already have resources in Cloudflare, import them:
bash# Import Worker
terraform import cloudflare_workers_script.worker <account_id>/<script_name>

# Import D1 Database
terraform import cloudflare_d1_database.mydb <account_id>/<database_id>

🔐 Security

✅ API tokens stored as environment variables only — never in .tf files
✅ Terraform state excluded from git via .gitignore
✅ Sensitive variables marked as sensitive = true in Terraform
✅ GitHub push protection enabled to block accidental secret commits


📦 Terraform Resources
ResourceTypeDescriptioncloudflare_workers_script.workerWorkerAPI Gateway (Worker 1)cloudflare_workers_script.worker2WorkerD1 Handler (Worker 2)cloudflare_d1_database.mydbD1Shared database for Worker 2

🛠️ Useful Commands
bash# Validate config
terraform validate

# Format all tf files
terraform fmt

# Show current state
terraform show

# Destroy all resources
terraform destroy

📝 Environment Variables Reference
VariableHow to setDescriptionCLOUDFLARE_API_TOKENexportCloudflare API tokenTF_VAR_grafana_otlp_auth_headerexportGrafana OTLP Basic auth header