
resource "cloudflare_d1_database" "mydb" {
  account_id = var.account_id
  name       = "mybinding"

  read_replication = {
    mode = "disabled"
  }
}