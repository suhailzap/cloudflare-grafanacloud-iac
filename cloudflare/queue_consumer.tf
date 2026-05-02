# -------------------------------------------------------
# Queue Consumers - Worker 2 consumes all queues
# -------------------------------------------------------

# Jobs queue consumer
resource "cloudflare_queue_consumer" "jobs_consumer" {
  account_id        = var.account_id
  queue_id          = cloudflare_queue.jobs.id
  script_name       = cloudflare_workers_script.worker2.script_name
  type              = "worker"
  dead_letter_queue = cloudflare_queue.jobs_dlq.queue_name

  settings = {
    batch_size       = 10
    max_retries      = 3
    max_wait_time_ms = 5000
    retry_delay      = 10
  }
}

# Notifications queue consumer
resource "cloudflare_queue_consumer" "notifications_consumer" {
  account_id  = var.account_id
  queue_id    = cloudflare_queue.notifications.id
  script_name = cloudflare_workers_script.worker2.script_name
  type        = "worker"

  settings = {
    batch_size       = 5
    max_retries      = 2
    max_wait_time_ms = 3000
    retry_delay      = 5
  }
}

# DLQ consumer - inspect failed messages
resource "cloudflare_queue_consumer" "dlq_consumer" {
  account_id  = var.account_id
  queue_id    = cloudflare_queue.jobs_dlq.id
  script_name = cloudflare_workers_script.worker2.script_name
  type        = "worker"

  settings = {
    batch_size       = 5
    max_retries      = 1
    max_wait_time_ms = 10000
    retry_delay      = 30
  }
}