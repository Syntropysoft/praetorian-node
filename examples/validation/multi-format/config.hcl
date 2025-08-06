# Example HCL configuration file

# Variables
database_host = "localhost"
database_port = 5432
database_name = "myapp"
database_ssl = true

api_host = "0.0.0.0"
api_port = 3000
api_timeout = 30
api_debug = false

redis_host = "localhost"
redis_port = 6379
redis_password = ""

logging_level = "info"
logging_format = "json"
logging_output = "stdout"

# Database configuration block
database "main" {
  host = database_host
  port = database_port
  name = database_name
  ssl = database_ssl
}

# API configuration block
api "web" {
  host = api_host
  port = api_port
  timeout = api_timeout
  debug = api_debug
}

# Redis configuration block
redis "cache" {
  host = redis_host
  port = redis_port
  password = redis_password
}

# Logging configuration block
logging "app" {
  level = logging_level
  format = logging_format
  output = logging_output
} 