#!/bin/bash

### Import helper functions and scripts #######################################

DIR="${BASH_SOURCE%/*}"
if [[ ! -d "$DIR" ]]; then DIR="$PWD"; fi

. "$DIR/dependency_checker.sh"
. "$DIR/helpers.sh"
. "$DIR/cleanup.sh"
. "$DIR/sonarqube_management.sh"
. "$DIR/analysers.sh"

### Default Configuration #####################################################

# Default values for various variables
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

# Flags to check if specific options were passed
FLAG_PROJECT_KEY=false
FLAG_PROJECT_NAME=false
FLAG_NEW_SONAR_PASSWORD=false
FLAG_PROJECT_BASEDIR=false
FLAG_HOST_SONAR_URL=false
FLAG_SONARQUBE_TOKEN_NAME=false

### Help Message ##############################################################

show_help() {
    echo "Usage: ${0##*/} [-k <project_key>] [-n <project_name>] [-p <new_password>] [-d <project_basedir>] [-u <host_sonar_url>] [-t <sonar_token_name>] [-s] [-h]"
    echo ""
    echo "Options:"
    echo "  -k <project_key>         Set the project key (default: $PROJECT_KEY)"
    echo "  -n <project_name>        Set the project name (default: $PROJECT_NAME)"
    echo "  -p <new_password>        Set the new SonarQube admin password (default: $NEW_SONAR_PASSWORD)"
    echo "  -d <project_basedir>     Set the directory to be scanned (default: $PROJECT_BASEDIR)"
    echo "  -u <host_sonar_url>      Set the host SonarQube URL (default: $HOST_SONAR_URL)"
    echo "  -t <sonar_token_name>    Set the SonarQube token name (default: $SONARQUBE_TOKEN_NAME)"
    echo "  -s                      Skip all prompts and use default values or passed flags"
    echo "  -h                      Show this help message and exit"
}

### Parse Flags ###############################################################

while getopts ":k:n:p:d:u:t:sh" opt; do
  case ${opt} in
    k ) # Project Key
      PROJECT_KEY=$OPTARG
      FLAG_PROJECT_KEY=true
      ;;
    n ) # Project Name
      PROJECT_NAME=$OPTARG
      FLAG_PROJECT_NAME=true
      ;;
    p ) # SonarQube admin password
      NEW_SONAR_PASSWORD=$OPTARG
      FLAG_NEW_SONAR_PASSWORD=true
      ;;
    d ) # Project Base Directory
      PROJECT_BASEDIR=$OPTARG
      FLAG_PROJECT_BASEDIR=true
      ;;
    u ) # Host Sonar URL
      HOST_SONAR_URL=$OPTARG
      FLAG_HOST_SONAR_URL=true
      ;;
    t ) # SonarQube token name
      SONARQUBE_TOKEN_NAME=$OPTARG
      FLAG_SONARQUBE_TOKEN_NAME=true
      ;;
    s ) # Skip all prompts
      SKIP_PROMPT=true
      ;;
    h ) # Show help
      show_help
      exit 0
      ;;
    \? ) # Invalid option
      echo "Invalid option: -$OPTARG" 1>&2
      show_help
      exit 1
      ;;
    : ) # Missing argument
      echo "Option -$OPTARG requires an argument." 1>&2
      show_help
      exit 1
      ;;
  esac
done

### Main Script ###############################################################

echo -e "🔧 Welcome to the SonarQube & CodeCharta Automation Script 🔧"
echo -e "------------------------------------------------------------"
echo -e "This script automates the process of:"
echo -e "1. Setting up a SonarQube project and resetting the default 'admin' password if needed."
echo -e "2. Running SonarScanner to analyze your project's source code."
echo -e "3. Conducting a CodeCharta analysis of the scanned data."
echo -e "------------------------------------------------------------\n"


# Prompt for important variables only if they weren't provided via flags
if [ "$SKIP_PROMPT" != true ]; then
    if [ "$FLAG_PROJECT_KEY" = false ]; then
        read -p "🔑 Enter the Project Key (default: $PROJECT_KEY): " input
        PROJECT_KEY=${input:-$PROJECT_KEY}
    fi

    if [ "$FLAG_PROJECT_NAME" = false ]; then
        read -p "📛 Enter the Project Name (default: $PROJECT_NAME): " input
        PROJECT_NAME=${input:-$PROJECT_NAME}
    fi

    if [ "$FLAG_NEW_SONAR_PASSWORD" = false ]; then
        read -p "🔒 Enter the new password for the SonarQube admin user (default: $NEW_SONAR_PASSWORD): " input
        NEW_SONAR_PASSWORD=${input:-$NEW_SONAR_PASSWORD}
    fi

    if [ "$FLAG_PROJECT_BASEDIR" = false ]; then
        read -p "📁 Enter the directory path to be scanned (default: $PROJECT_BASEDIR): " input
        PROJECT_BASEDIR=${input:-$PROJECT_BASEDIR}
    fi
fi

# URL-encode PROJECT_KEY and PROJECT_NAME
ENCODED_PROJECT_KEY=$(urlencode "$PROJECT_KEY")
ENCODED_PROJECT_NAME=$(urlencode "$PROJECT_NAME")

# Build reusable command
cmd="./${0##*/}"
cmd+=" -k \"$PROJECT_KEY\""
cmd+=" -n \"$PROJECT_NAME\""
cmd+=" -p \"$NEW_SONAR_PASSWORD\""
cmd+=" -d \"$PROJECT_BASEDIR\""
cmd+=" -u \"$HOST_SONAR_URL\""
cmd+=" -t \"$SONARQUBE_TOKEN_NAME\""

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

### Run the steps #############################################################

check_dependencies

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

### Print Reusable Command ####################################################

echo -e "\nTo run this script again without prompts, use the following command:"
echo "$cmd"
