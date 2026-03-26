output "ec2_public_ip" {
  description = "EC2 instance public IP adresi"
  value       = aws_instance.app_server.public_ip
}

output "ec2_public_dns" {
  description = "EC2 instance public DNS"
  value       = aws_instance.app_server.public_dns
}

output "frontend_ecr_url" {
  description = "Frontend ECR repository URL"
  value       = aws_ecr_repository.frontend.repository_url
}

output "backend_ecr_url" {
  description = "Backend ECR repository URL"
  value       = aws_ecr_repository.backend.repository_url
}

output "github_actions_access_key_id" {
  description = "GitHub Actions IAM user Access Key ID"
  value       = aws_iam_access_key.github_actions.id
  sensitive   = false
}

output "github_actions_secret_access_key" {
  description = "GitHub Actions IAM user Secret Access Key (terraform output -raw github_actions_secret_access_key)"
  value       = aws_iam_access_key.github_actions.secret
  sensitive   = true
}

output "ssh_connect_command" {
  description = "EC2'ye SSH bağlantı komutu"
  value       = "ssh -i ~/.ssh/id_rsa ubuntu@${aws_instance.app_server.public_ip}"
}

output "app_url" {
  description = "Uygulamaya erişim URL'i"
  value       = "http://${aws_instance.app_server.public_ip}"
}
