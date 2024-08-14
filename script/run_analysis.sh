#!/bin/bash

# Import the necessary helper scripts
DIR="${BASH_SOURCE%/*}"
if [[ ! -d "$DIR" ]]; then DIR="$PWD"; fi

. "$DIR/dependency_checker.sh"
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
SONARQUBE_TOKEN_NAME="codecharta_token"  # Name of the SonarQube token
SONARQUBE_TOKEN=""                       # Token generated for SonarScanner (optional, will generate a new one if empty)
PROJECT_BASEDIR="$(pwd)/visualization"   # Directory to be scanned
OUTPUT_PATH="$(pwd)/output"              # Directory for the output
NETWORK_NAME="sonarnet"
SONAR_CONTAINER_NAME="sonarqube"

RUN_PROJECT_CLEANUP=true  # Set to true to delete the existing SonarQube project
RUN_FINAL_CLEANUP=false    # Set to true to perform final cleanup of Docker containers and networks
RUN_SONAR_SCANNER=true     # Set to false to skip running SonarScanner
WAIT_TIME=60               # Time in seconds to wait after running SonarScanner

# Run the steps
ensure_sonarqube_running

# Conditionally reset password
reset_sonarqube_password

# Conditionally clean up previous project
if $RUN_PROJECT_CLEANUP; then
    cleanup_previous_project
fi

# Always revoke the existing token
revoke_token

# Create the project and generate the token
create_sonarqube_project
generate_token

# Conditionally run the SonarScanner
if $RUN_SONAR_SCANNER; then
    run_sonarscanner

    # Wait for the data to be fully uploaded to SonarQube
    echo "⏳ Waiting for $WAIT_TIME seconds to ensure data is uploaded to SonarQube..."
    sleep $WAIT_TIME
fi

# Run the CodeCharta analysis
run_codecharta_analysis

# Final cleanup if enabled
if $RUN_FINAL_CLEANUP; then
    cleanup
fi
