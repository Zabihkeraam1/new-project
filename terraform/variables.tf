variable "AWS_ACCESS_KEY_ID" {
  description = "AWS Access Key ID"
  type        = string
  sensitive   = true
}

variable "AWS_SECRET_ACCESS_KEY" {
  description = "AWS Secret Access Key"
  type        = string
  sensitive   = true
}

variable "customer_name" {
  type        = string
  description = "Name of the customer"
}

variable "project" {
  type        = string
  description = "Name of the project"
}


variable "region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region"
}

variable "repository_url" {
  type        = string
  description = "GitHub repository URL for the backend service"
}
