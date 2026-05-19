# Security group for the StudyAI application
resource "aws_security_group" "studyai_sg" {
  name        = "${var.project_name}-sg"
  description = "Security group for StudyAI ECS container instance"
  vpc_id      = aws_vpc.main.id

  # Allow inbound traffic to the application port
  ingress {
    description = "Allow application traffic on port 3000"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow SSH for administration
  ingress {
    description = "Allow SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic (required to reach ECR, Groq API, SSM)
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project_name}-sg"
    Project = "studyai"
  }
}
