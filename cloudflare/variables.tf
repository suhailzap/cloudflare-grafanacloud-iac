variable "account_id" {
  description = "Cloudflare Account ID"
  type        = string
  default     = "e489d2e8ad98327fd10d5c33cb6a1b1e"
}

variable "grafana_otlp_auth_header" {
  description = "Grafana OTLP auth header for OTEL_EXPORTER_OTLP_HEADERS binding (sensitive)"
  type        = string
  sensitive   = true
 
}