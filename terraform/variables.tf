variable "aws_region" {
  description = "AWS region to deploy resources in"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for naming resources"
  type        = string
  default     = "studyai"
}

variable "ec2_key_pair_name" {
  description = "Name of EC2 key pair for SSH access to the ECS container instance"
  type        = string
}

variable "groq_api_key" {
  description = "Groq API key for the StudyAI application (stored in SSM SecureString)"
  type        = string
  sensitive   = true
}
