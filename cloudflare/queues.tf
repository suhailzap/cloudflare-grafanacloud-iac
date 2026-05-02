# -------------------------------------------------------
# Cloudflare Queues
# -------------------------------------------------------

# Jobs Queue - Worker 1 produces, Worker 2 consumes
resource "cloudflare_queue" "jobs" {
  account_id = var.account_id
  queue_name = "worker-jobs-queue"

  settings = {
    delivery_delay           = 0
    delivery_paused          = false
    message_retention_period = 86400  # 24 hours in seconds
  }
}

# Dead Letter Queue - failed messages land here
resource "cloudflare_queue" "jobs_dlq" {
  account_id = var.account_id
  queue_name = "worker-jobs-dlq"

  settings = {
    delivery_delay           = 0
    delivery_paused          = false
    message_retention_period = 86400  # 4 days in seconds
  }
}

# Notifications Queue
resource "cloudflare_queue" "notifications" {
  account_id = var.account_id
  queue_name = "worker-notifications-queue"

  settings = {
    delivery_delay           = 0
    delivery_paused          = false
    message_retention_period = 3600  # 1 hour in seconds
  }
}