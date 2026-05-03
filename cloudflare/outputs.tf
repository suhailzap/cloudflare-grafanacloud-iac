output "worker_id" {
  description = "Cloudflare Worker 1 script name"
  value       = cloudflare_workers_script.worker.id
}

output "worker2_id" {
  description = "Cloudflare Worker 2 script name"
  value       = cloudflare_workers_script.worker2.id
}

output "d1_database_id" {
  description = "D1 Database UUID"
  value       = cloudflare_d1_database.mydb.id
}

output "d1_database_name" {
  description = "D1 Database name"
  value       = cloudflare_d1_database.mydb.name
}

output "worker_url" {
  description = "Worker 1 public URL"
  value       = "https://bitter-flower-57f0.fayizaai7.workers.dev"
}

output "jobs_queue_name" {
  description = "Jobs queue name"
  value       = cloudflare_queue.jobs.queue_name
}

output "jobs_dlq_name" {
  description = "Dead letter queue name"
  value       = cloudflare_queue.jobs_dlq.queue_name
}

output "notifications_queue_name" {
  description = "Notifications queue name"
  value       = cloudflare_queue.notifications.queue_name
}