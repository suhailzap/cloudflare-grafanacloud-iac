output "worker_id" {
  description = "Cloudflare Worker script name"
  value       = cloudflare_workers_script.worker.id
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
  description = "Worker public URL"
  value       = "https://bitter-flower-57f0.fayizaai7.workers.dev"
}