# Archive the Lambda function source code
data "archive_file" "health_check_zip" {
  type        = "zip"
  source_file = "${path.module}/../lambda/health_check.py"
  output_path = "${path.module}/../lambda/health_check.zip"
}

# Lambda function for periodic health checks
resource "aws_lambda_function" "health_check" {
  function_name    = "${var.project_name}-health-check"
  role             = aws_iam_role.lambda_execution_role.arn
  handler          = "health_check.lambda_handler"
  runtime          = "python3.12"
  filename         = data.archive_file.health_check_zip.output_path
  source_code_hash = data.archive_file.health_check_zip.output_base64sha256
  timeout          = 30
  description      = "Periodic health check for the StudyAI application"

  environment {
    variables = {
      APP_URL = "http://${aws_instance.ecs_instance.public_ip}:3000"
    }
  }

  depends_on = [aws_iam_role_policy.lambda_logs]

  tags = {
    Name    = "${var.project_name}-health-check"
    Project = "studyai"
  }
}

# CloudWatch Events rule: run every 5 minutes
resource "aws_cloudwatch_event_rule" "health_check_schedule" {
  name                = "${var.project_name}-health-check-schedule"
  description         = "Trigger StudyAI health check Lambda every 5 minutes"
  schedule_expression = "rate(5 minutes)"
  state               = "ENABLED"

  tags = {
    Name    = "${var.project_name}-health-check-schedule"
    Project = "studyai"
  }
}

# Connect the EventBridge rule to the Lambda function
resource "aws_cloudwatch_event_target" "health_check_target" {
  rule      = aws_cloudwatch_event_rule.health_check_schedule.name
  target_id = "${var.project_name}-health-check"
  arn       = aws_lambda_function.health_check.arn
}

# Allow EventBridge to invoke the Lambda function
resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.health_check.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.health_check_schedule.arn
}

# CloudWatch log group for Lambda logs
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.project_name}-health-check"
  retention_in_days = 7

  tags = {
    Name    = "/aws/lambda/${var.project_name}-health-check"
    Project = "studyai"
  }
}
