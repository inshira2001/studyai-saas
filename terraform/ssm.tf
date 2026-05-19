resource "aws_ssm_parameter" "groq_api_key" {
  name        = "/${var.project_name}/groq-api-key"
  type        = "SecureString"
  value       = var.groq_api_key
  description = "Groq API key for the StudyAI application"

  tags = {
    Name    = "${var.project_name}-groq-api-key"
    Project = "studyai"
  }
}
