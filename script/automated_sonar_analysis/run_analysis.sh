#!/bin/bash

### Import helper functions and scripts #######################################

DIR="${BASH_SOURCE%/*}"
if [[ ! -d "$DIR" ]]; then DIR="$PWD"; fi

. "$DIR/dependency_checker.sh"
. "$DIR/helpers.sh"
. "$DIR/cleanup.sh"
. "$DIR/sonarqube_management.sh"
. "$DIR/analysers.sh"

### Configuration #############################################################

# PROJECT_KEY: A unique identifier for the project in SonarQube.
PROJECT_KEY="maibornwolff-gmbh_codecharta_visualization"

# PROJECT_NAME: The name of the project in SonarQube.
PROJECT_NAME="CodeCharta Visualization"

# NEW_SONAR_PASSWORD: The new password to set for the SonarQube admin user.
# If the default 'admin' password is still in use, the script will change it to this value.
NEW_SONAR_PASSWORD="newadminpassword"

# PROJECT_BASEDIR: The directory containing the source code to be analyzed.
PROJECT_BASEDIR="$(cd "$(dirname "$DIR")/../visualization" && pwd)"

# Other variables with default values
HOST_SONAR_URL="http://localhost:9000"   # URL used by the host machine to access the SonarQube server
CONTAINER_SONAR_URL="http://sonarqube:9000"  # URL used by other Docker containers to access the SonarQube server
DEFAULT_SONAR_USER="admin"
DEFAULT_SONAR_PASSWORD="admin"
SONARQUBE_TOKEN_NAME="codecharta_token"
SONARQUBE_TOKEN=""
NETWORK_NAME="sonarnet"
SONAR_CONTAINER_NAME="sonarqube"

# Set to true to delete the existing SonarQube project
RUN_PROJECT_CLEANUP=true
# Set to true to run SonarScanner
RUN_SONAR_SCANNER=true    
# Set to true to run the final cleanup of Docker containers and networks
RUN_FINAL_CLEANUP=false    
# Timeout period in seconds for waiting on SonarQube data processing and startup
TIMEOUT_PERIOD=10000


### Main Script ###############################################################

# Introductory message explaining the script's purpose
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

# If skip prompt mode is not enabled, prompt for important variables with defaults
if [ "$SKIP_PROMPT" = false ]; then
    # Allow the user to override the default values if desired
    read -p "🔑 Enter the Project Key (default: $PROJECT_KEY): " input
    PROJECT_KEY=${input:-$PROJECT_KEY}

    read -p "📛 Enter the Project Name (default: $PROJECT_NAME): " input
    PROJECT_NAME=${input:-$PROJECT_NAME}

    read -p "🔒 Enter the new password for the SonarQube admin user (default: $NEW_SONAR_PASSWORD): " input
    NEW_SONAR_PASSWORD=${input:-$NEW_SONAR_PASSWORD}

    read -p "📁 Enter the directory path to be scanned (default: $PROJECT_BASEDIR): " input
    PROJECT_BASEDIR=${input:-$PROJECT_BASEDIR}
fi

# URL-encode PROJECT_KEY and PROJECT_NAME
ENCODED_PROJECT_KEY=$(urlencode "$PROJECT_KEY")
ENCODED_PROJECT_NAME=$(urlencode "$PROJECT_NAME")

# Present a menu to the user to select which steps to run
steps=("Ensure SonarQube Running" "Reset SonarQube Password" "Clean Up Previous Project" "Revoke Token" "Create Project and Generate Token" "Run SonarScanner" "Run CodeCharta Analysis" "Final Cleanup")

preselected_indices=(0 1 2 3 4 5 6 7)  # By default, all steps are preselected

# Call the `show_menu` function from helpers.sh
show_menu "${#steps[@]}" "${steps[@]}" "${#preselected_indices[@]}" "${preselected_indices[@]}"

# Now selected_options array contains the selected items
selected_steps=("${selected_options[@]}")
echo -e "\nRunning:"
for i in "${!selected_options[@]}"; do
    echo "  $((i + 1))) ${selected_options[i]}"
done

# Execute the steps based on user selection
for step in "${selected_steps[@]}"; do
    case $step in
        "Ensure SonarQube Running")
            ensure_sonarqube_running
            ;;
        "Reset SonarQube Password")
            reset_sonarqube_password
            ;;
        "Clean Up Previous Project")
            cleanup_previous_project
            ;;
        "Revoke Token")
            revoke_token
            ;;
        "Create Project and Generate Token")
            create_sonarqube_project
            generate_token
            ;;
        "Run SonarScanner")
            run_sonarscanner
            ;;
        "Run CodeCharta Analysis")
            run_codecharta_analysis
            ;;
        "Final Cleanup")
            cleanup
            ;;
    esac
done
