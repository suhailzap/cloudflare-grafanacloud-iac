resource "cloudflare_workers_script" "worker" {
  account_id         = var.account_id
  script_name        = "bitter-flower-57f0"
  compatibility_date = "2026-04-19"
  usage_model        = "standard"
  main_module = "worker.js"
  content = file("${path.module}/worker.js")
  
  bindings = [
    {
      name = "MY_BINDING"
      type = "d1"
      id   = cloudflare_d1_database.mydb.id
    },
    {
      name = "OTEL_EXPORTER_OTLP_HEADERS"
      type = "plain_text"
      text = var.grafana_otlp_auth_header
    },
  {
    name = "OTEL_EXPORTER_OTLP_ENDPOINT"
    type = "plain_text"
    text = "https://otlp-gateway-prod-ap-south-1.grafana.net/otlp"
  }

  ]

  observability = {
    enabled            = true
    head_sampling_rate = 1

    logs = {
      enabled            = true
      head_sampling_rate = 1
      invocation_logs    = true
      persist            = true
      destinations       = ["grafana-loging"]
    }

    traces = {
      enabled            = true
      head_sampling_rate = 1
      persist            = true
      destinations       = ["grafana-tracing"]
    }
  }
}

