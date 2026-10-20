#!/bin/bash

DIR="${BASH_SOURCE%/*}"
if [[ ! -d "$DIR" ]]; then DIR="$PWD"; fi

. "$DIR/dependency_checker.sh"
. "$DIR/helpers.sh"
. "$DIR/cleanup.sh"
. "$DIR/sonarqube_management.sh"
. "$DIR/analysers.sh"

PROJECT_KEY="maibornwolff-gmbh_codecharta_visualization"
PROJECT_NAME="CodeCharta Visualization"
PROJECT_BASEDIR="$(cd "$(dirname "$DIR")/../visualization" && pwd)"

# replaces the default 'admin' password while that is still in use
NEW_SONAR_PASSWORD="newadminpassword"

# SonarScanner and ccsh run in containers of their own, which reach SonarQube by its container name
HOST_SONAR_URL="http://localhost:9000"
CONTAINER_SONAR_URL="http://sonarqube:9000"
DEFAULT_SONAR_USER="admin"
DEFAULT_SONAR_PASSWORD="admin"
SONARQUBE_TOKEN_NAME="codecharta_token"
SONARQUBE_TOKEN=""
NETWORK_NAME="sonarnet"
SONAR_CONTAINER_NAME="sonarqube"

RUN_PROJECT_CLEANUP=true
RUN_SONAR_SCANNER=true
RUN_FINAL_CLEANUP=false
# seconds to wait for SonarQube to start and to process the data
TIMEOUT_PERIOD=10000

FLAG_PROJECT_KEY=false
FLAG_PROJECT_NAME=false
FLAG_NEW_SONAR_PASSWORD=false
FLAG_PROJECT_BASEDIR=false
FLAG_HOST_SONAR_URL=false
FLAG_SONARQUBE_TOKEN_NAME=false
SKIP_PROMPT=false

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

while getopts ":k:n:p:d:u:t:sh" opt; do
  case ${opt} in
    k ) PROJECT_KEY=$OPTARG; FLAG_PROJECT_KEY=true ;;
    n ) PROJECT_NAME=$OPTARG; FLAG_PROJECT_NAME=true ;;
    p ) NEW_SONAR_PASSWORD=$OPTARG; FLAG_NEW_SONAR_PASSWORD=true ;;
    d ) PROJECT_BASEDIR=$OPTARG; FLAG_PROJECT_BASEDIR=true ;;
    u ) HOST_SONAR_URL=$OPTARG; FLAG_HOST_SONAR_URL=true ;;
    t ) SONARQUBE_TOKEN_NAME=$OPTARG; FLAG_SONARQUBE_TOKEN_NAME=true ;;
    s ) SKIP_PROMPT=true ;;
    h ) show_help; exit 0 ;;
    \? ) echo "Invalid option: -$OPTARG" 1>&2; show_help; exit 1 ;;
    : ) echo "Option -$OPTARG requires an argument." 1>&2; show_help; exit 1 ;;
  esac
done

echo -e "🔧 Welcome to the SonarQube & CodeCharta Automation Script 🔧"
echo -e "------------------------------------------------------------"
echo -e "This script automates the process of:"
echo -e "1. Setting up a SonarQube project and resetting the default 'admin' password if needed."
echo -e "2. Running SonarScanner to analyze your project's source code."
echo -e "3. Conducting a CodeCharta analysis of the scanned data."
echo -e "------------------------------------------------------------\n"

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

ENCODED_PROJECT_KEY=$(urlencode "$PROJECT_KEY")
ENCODED_PROJECT_NAME=$(urlencode "$PROJECT_NAME")

reusable_command="./${0##*/}"
reusable_command+=" -k \"$PROJECT_KEY\""
reusable_command+=" -n \"$PROJECT_NAME\""
reusable_command+=" -p \"$NEW_SONAR_PASSWORD\""
reusable_command+=" -d \"$PROJECT_BASEDIR\""
reusable_command+=" -u \"$HOST_SONAR_URL\""
reusable_command+=" -t \"$SONARQUBE_TOKEN_NAME\""

all_steps=("Ensure SonarQube Running" "Reset SonarQube Password" "Clean Up Previous Project" "Revoke Token" "Create Project and Generate Token" "Run SonarScanner" "Run CodeCharta Analysis" "Final Cleanup")

selected_steps=("${all_steps[@]}")
if [ "$SKIP_PROMPT" != true ]; then
    read -p "Would you like to select individual steps to run? (y/N): " select_steps

    if [[ "$select_steps" =~ ^[Yy]$ ]]; then
        all_step_indices=("${!all_steps[@]}")
        show_menu "${#all_steps[@]}" "${all_steps[@]}" "${#all_step_indices[@]}" "${all_step_indices[@]}"
        selected_steps=("${selected_options[@]}")
    fi
fi

check_dependencies

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

echo -e "\nTo run this script again without prompts, use the following command:"
echo "$reusable_command"
