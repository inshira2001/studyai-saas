# Fetch the latest ECS-optimized Amazon Linux 2 AMI from SSM
data "aws_ssm_parameter" "ecs_ami" {
  name = "/aws/service/ecs/optimized-ami/amazon-linux-2/recommended/image_id"
}

# CloudWatch log group for ECS container logs
resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/${var.project_name}"
  retention_in_days = 7

  tags = {
    Name    = "/ecs/${var.project_name}"
    Project = "studyai"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "disabled"
  }

  tags = {
    Name    = "${var.project_name}-cluster"
    Project = "studyai"
  }
}

# EC2 instance running the ECS agent
resource "aws_instance" "ecs_instance" {
  ami                    = data.aws_ssm_parameter.ecs_ami.value
  instance_type          = "t3.micro"
  key_name               = var.ec2_key_pair_name
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.studyai_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ecs_instance_profile.name

  # Bootstrap the ECS agent to join our cluster
  user_data = base64encode(<<-EOF
    #!/bin/bash
    echo ECS_CLUSTER=${aws_ecs_cluster.main.name} >> /etc/ecs/ecs.config
    echo ECS_ENABLE_CONTAINER_METADATA=true >> /etc/ecs/ecs.config
  EOF
  )

  # Ensure instance is replaced if user_data changes
  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name    = "${var.project_name}-ecs-instance"
    Project = "studyai"
  }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "studyai" {
  family                   = var.project_name
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  memory                   = "768"
  cpu                      = "512"

  container_definitions = jsonencode([
    {
      name      = var.project_name
      image     = "${aws_ecr_repository.studyai.repository_url}:latest"
      essential = true
      memory    = 768
      cpu       = 512

      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]

      secrets = [
        {
          name      = "GROQ_API_KEY"
          valueFrom = aws_ssm_parameter.groq_api_key.arn
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "PORT"
          value = "3000"
        },
        {
          name  = "HOSTNAME"
          value = "0.0.0.0"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.project_name}"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name    = var.project_name
    Project = "studyai"
  }
}

# ECS Service
resource "aws_ecs_service" "studyai" {
  name            = "${var.project_name}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.studyai.arn
  desired_count   = 1
  launch_type     = "EC2"

  # Allow replacement on single t2.micro instance
  deployment_minimum_healthy_percent = 0
  deployment_maximum_percent         = 100

  # Force new deployment when task definition changes
  force_new_deployment = true

  depends_on = [aws_instance.ecs_instance]

  tags = {
    Name    = "${var.project_name}-service"
    Project = "studyai"
  }
}
