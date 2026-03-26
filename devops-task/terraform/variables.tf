variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "eu-central-1" # Frankfurt - Türkiye'ye en yakın
}

variable "project_name" {
  description = "Proje adı (tüm kaynaklara prefix olarak eklenir)"
  type        = string
  default     = "devops-task"
}

variable "ssh_public_key" {
  description = "EC2'ye bağlanmak için SSH public key (~/.ssh/id_rsa.pub içeriği)"
  type        = string
  # terraform.tfvars dosyasına ekleyin - buraya yazmayın!
}
