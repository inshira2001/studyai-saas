output "app_url" {
  value       = "http://${aws_instance.ecs_instance.public_ip}:3000"
  description = "URL to access the StudyAI application"
}

output "ecr_repository_url" {
  value       = aws_ecr_repository.studyai.repository_url
  description = "ECR repository URL for pushing Docker images"
}

output "ecs_cluster_name" {
  value       = aws_ecs_cluster.main.name
  description = "ECS cluster name"
}

output "ecs_service_name" {
  value       = aws_ecs_service.studyai.name
  description = "ECS service name"
}

output "ec2_instance_id" {
  value       = aws_instance.ecs_instance.id
  description = "EC2 instance ID for the ECS container instance"
}

output "ssm_parameter_name" {
  value       = aws_ssm_parameter.groq_api_key.name
  description = "SSM parameter name storing the Groq API key"
}

output "health_check_lambda_name" {
  value       = aws_lambda_function.health_check.function_name
  description = "Lambda function name for health checks"
}
