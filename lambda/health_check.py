import json
import os
import urllib.request
import urllib.error
import time


def lambda_handler(event, context):
    """
    Periodic health check for the StudyAI application.
    Triggered every 5 minutes by EventBridge.
    Logs structured JSON results to CloudWatch Logs.
    """
    app_url = os.environ.get("APP_URL", "http://localhost:3000")
    health_url = f"{app_url}/api/health"

    start = time.time()

    try:
        req = urllib.request.Request(health_url, method="GET")
        req.add_header("User-Agent", "StudyAI-HealthCheck/1.0")

        with urllib.request.urlopen(req, timeout=10) as response:
            elapsed_ms = int((time.time() - start) * 1000)
            status_code = response.status
            body = response.read().decode("utf-8")

            # Attempt to parse the health response body
            try:
                parsed_body = json.loads(body)
            except json.JSONDecodeError:
                parsed_body = body

            log_entry = {
                "event": "health_check",
                "status": "OK",
                "http_status": status_code,
                "response_time_ms": elapsed_ms,
                "url": health_url,
                "body": parsed_body,
            }

            print(json.dumps(log_entry))

            return {
                "statusCode": 200,
                "body": json.dumps(log_entry),
            }

    except urllib.error.HTTPError as e:
        elapsed_ms = int((time.time() - start) * 1000)
        log_entry = {
            "event": "health_check",
            "status": "HTTP_ERROR",
            "http_status": e.code,
            "error": str(e.reason),
            "response_time_ms": elapsed_ms,
            "url": health_url,
            "alert": "STUDYAI APP RETURNED HTTP ERROR",
        }
        print(json.dumps(log_entry))
        return {"statusCode": 500, "body": json.dumps(log_entry)}

    except urllib.error.URLError as e:
        elapsed_ms = int((time.time() - start) * 1000)
        log_entry = {
            "event": "health_check",
            "status": "CONNECTION_ERROR",
            "error": str(e.reason),
            "response_time_ms": elapsed_ms,
            "url": health_url,
            "alert": "STUDYAI APP IS DOWN — CANNOT CONNECT",
        }
        print(json.dumps(log_entry))
        return {"statusCode": 500, "body": json.dumps(log_entry)}

    except TimeoutError:
        elapsed_ms = int((time.time() - start) * 1000)
        log_entry = {
            "event": "health_check",
            "status": "TIMEOUT",
            "error": "Request timed out after 10 seconds",
            "response_time_ms": elapsed_ms,
            "url": health_url,
            "alert": "STUDYAI APP IS UNRESPONSIVE — TIMEOUT",
        }
        print(json.dumps(log_entry))
        return {"statusCode": 500, "body": json.dumps(log_entry)}

    except Exception as e:
        elapsed_ms = int((time.time() - start) * 1000)
        log_entry = {
            "event": "health_check",
            "status": "ERROR",
            "error": str(e),
            "error_type": type(e).__name__,
            "response_time_ms": elapsed_ms,
            "url": health_url,
            "alert": "STUDYAI APP IS DOWN",
        }
        print(json.dumps(log_entry))
        return {"statusCode": 500, "body": json.dumps(log_entry)}
