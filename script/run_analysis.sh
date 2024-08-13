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
SONARQUBE_TOKEN_NAME="codecharta_token"  # Name of the SonarQube token
SONARQUBE_TOKEN=""                       # Token generated for SonarScanner (optional, will generate a new one if empty)
PROJECT_BASEDIR="$(pwd)/visualization"   # Directory to be scanned
OUTPUT_PATH="$(pwd)/output"              # Directory for the output
NETWORK_NAME="sonarnet"
SONAR_CONTAINER_NAME="sonarqube"

RUN_CLEANUP=true        # Set to false to skip cleanup
RUN_SONAR_SCANNER=true  # Set to false to skip running SonarScanner
WAIT_TIME=60            # Time in seconds to wait after running SonarScanner

# Run the steps
ensure_sonarqube_running

# Conditionally reset password
reset_sonarqube_password

# Conditionally clean up previous project and token
if $RUN_CLEANUP; then
    cleanup_previous_project_and_token
fi

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
if $RUN_CLEANUP; then
    cleanup
fi
