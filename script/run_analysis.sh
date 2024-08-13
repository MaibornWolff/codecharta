#!/bin/bash

# Import the necessary helper scripts
DIR="${BASH_SOURCE%/*}"
if [[ ! -d "$DIR" ]]; then DIR="$PWD"; fi

. "$DIR/helpers.sh"
. "$DIR/cleanup.sh"
. "$DIR/sonarqube_management.sh"
. "$DIR/analysis.sh"

# Define variables
HOST_SONAR_URL="http://localhost:9000"   # Host's URL to access SonarQube
CONTAINER_SONAR_URL="http://sonarqube:9000"  # Container's URL to access SonarQube
PROJECT_KEY="test_key"
PROJECT_NAME="test_project"
DEFAULT_SONAR_USER="admin"
DEFAULT_SONAR_PASSWORD="admin"
NEW_SONAR_PASSWORD="newadminpassword"    # Define the new password you want to set
TOKEN_NAME="codecharta_token"
PROJECT_BASEDIR="$(pwd)/visualization"   # Directory to be scanned
OUTPUT_PATH="$(pwd)/output"              # Directory for the output
NETWORK_NAME="sonarnet"
SONAR_CONTAINER_NAME="sonarqube"

# Run the steps
ensure_sonarqube_running
reset_sonarqube_password
cleanup_previous_project_and_token
create_sonarqube_project
generate_token
run_sonarscanner
run_codecharta_analysis

# Final cleanup
cleanup
