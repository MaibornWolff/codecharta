#!/bin/bash

# Import the necessary helper scripts
DIR="${BASH_SOURCE%/*}"
if [[ ! -d "$DIR" ]]; then DIR="$PWD"; fi

. "$DIR/dependency_checker.sh"
. "$DIR/helpers.sh"
. "$DIR/cleanup.sh"
. "$DIR/sonarqube_management.sh"
. "$DIR/analysis.sh"

#!/bin/bash

# Display a well-formatted introductory text
echo -e "🔧 Welcome to the SonarQube & CodeCharta Automation Script 🔧"
echo -e "------------------------------------------------------------"
echo -e "This script automates the process of:"
echo -e "1. Setting up a SonarQube project and resetting the default 'admin' password if needed."
echo -e "2. Running SonarScanner to analyze your project's source code."
echo -e "3. Conducting a CodeCharta analysis of the scanned data."
echo -e "\nYou can choose to provide custom values for the project configuration or use the defaults."
echo -e "To skip the prompts and use all default values, run the script with the -s flag."
echo -e "If the default 'admin' password is still in use, the script will change it to the new password you provide."
echo -e "Note: This is only relevant for users who do not already have an instance of SonarQube running."
echo -e "------------------------------------------------------------\n"

# Check for skip prompt flag
SKIP_PROMPT=false
while getopts ":s" opt; do
  case ${opt} in
    s )
      SKIP_PROMPT=true
      ;;
    \? )
      echo "Invalid option: -$OPTARG" 1>&2
      exit 1
      ;;
  esac
done

# Other variables with default values
HOST_SONAR_URL="http://localhost:9000"   # URL used by the host machine to access the SonarQube server
CONTAINER_SONAR_URL="http://sonarqube:9000"  # URL used by other Docker containers to access the SonarQube server
DEFAULT_SONAR_USER="admin"
DEFAULT_SONAR_PASSWORD="admin"
SONARQUBE_TOKEN_NAME="codecharta_token"
SONARQUBE_TOKEN=""
OUTPUT_PATH="$(pwd)/output"
NETWORK_NAME="sonarnet"
SONAR_CONTAINER_NAME="sonarqube"

RUN_PROJECT_CLEANUP=true  # Set to true to delete the existing SonarQube project
RUN_FINAL_CLEANUP=false   # Set to true to perform final cleanup of Docker containers and networks
RUN_SONAR_SCANNER=true    # Set to false to skip running SonarScanner
WAIT_TIME=60              # Time in seconds to wait after running SonarScanner

# If skip prompt mode is not enabled, prompt for important variables with defaults
if [ "$SKIP_PROMPT" = false ]; then
    # PROJECT_KEY: A unique identifier for the project in SonarQube.
    # Default is set to 'test_key'.
    read -p "🔑 Enter the Project Key (default: test_key): " PROJECT_KEY
    PROJECT_KEY=${PROJECT_KEY:-test_key}

    # PROJECT_NAME: The name of the project in SonarQube.
    # Default is set to 'test_project'.
    read -p "📛 Enter the Project Name (default: test_project): " PROJECT_NAME
    PROJECT_NAME=${PROJECT_NAME:-test_project}

    # NEW_SONAR_PASSWORD: The new password to set for the SonarQube admin user.
    # If the default 'admin' password is still in use, the script will change it to this value.
    # Default is set to 'newadminpassword'.
    read -p "🔒 Enter the new password for the SonarQube admin user (default: newadminpassword): " NEW_SONAR_PASSWORD
    NEW_SONAR_PASSWORD=${NEW_SONAR_PASSWORD:-newadminpassword}

    # PROJECT_BASEDIR: The directory containing the source code to be analyzed.
    # Default is the 'visualization' directory within the current working directory.
    read -p "📁 Enter the directory path to be scanned (default: $(pwd)/visualization): " PROJECT_BASEDIR
    PROJECT_BASEDIR=${PROJECT_BASEDIR:-$(pwd)/visualization}
else
    # Default values if skip prompt is enabled
    PROJECT_KEY="test_key"
    PROJECT_NAME="test_project"
    NEW_SONAR_PASSWORD="newadminpassword"
    PROJECT_BASEDIR="$(pwd)/visualization"
fi

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
