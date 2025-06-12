#!/bin/bash

# A script to create a new SonarQube project and run an initial analysis.
#
# USAGE: ./simplecc_with_sonar.sh import <FolderName> <SonarUserToken>
#
# Example from 'Projects/' directory:
# ./simplecc_with_sonar.sh import Project1 sqp_abcdef1234567890

# --- Configuration ---
# Set the URL of your SonarQube server here.
# IMPORTANT: Do not include a trailing slash!
SONAR_URL="http://localhost:9000"

# --- Script Logic ---
command_exists() {
    command -v "$1" >/dev/null 2>&1
    if [[ $? -ne 0 ]]; then
        echo "I require $1 but it's not installed, aborting. Please check install instructions at $2 and try again."
        exit 1
    fi
}
command_exists "jq" "https://github.com/thoughtbot/complexity"
command_exists "complexity" "https://github.com/thoughtbot/complexity"
command_exists "tokei" "https://github.com/XAMPPRocky/tokei"
command_exists "ccsh" "https://codecharta.com/docs/overview/getting-started#installation"
command_exists "git" "https://git-scm.com/"
# 1. Input Validation
# --------------------------------------------------
set -e # Exit immediately if a command exits with a non-zero status.

if [ "$#" -ne 3 ] || [ "$1" != "import" ]; then
    echo "❌ ERROR: Invalid arguments."
    echo "   Usage: $0 import <FolderName> <SonarUserToken>"
    exit 1
fi

PROJECT_DIR=$2
SONAR_TOKEN=$3

if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ ERROR: Directory '$PROJECT_DIR' not found."
    echo "   Please run this script from the parent directory containing '$PROJECT_DIR'."
    exit 1
fi

# Use the directory name as the SonarQube project key and name.
PROJECT_KEY=$PROJECT_DIR
PROJECT_NAME=$PROJECT_DIR

echo "▶️  Starting SonarQube import process..."
echo "----------------------------------------"
echo "  SonarQube Server: $SONAR_URL"
echo "  Project Name:     $PROJECT_NAME"
echo "  Project Key:      $PROJECT_KEY"
echo "  Project Folder:   $PROJECT_DIR"
echo "----------------------------------------"


# 2. Check if Project Exists and Create if Necessary
# --------------------------------------------------
echo "➡️  Step 1: Checking if project '$PROJECT_KEY' exists on SonarQube..."

PROJECT_EXISTS_RESPONSE=$(curl -s -u "${SONAR_TOKEN}:" "${SONAR_URL}/api/projects/search?projects=${PROJECT_KEY}")
PROJECT_COUNT=$(echo "$PROJECT_EXISTS_RESPONSE" | jq '.paging.total')



if [ "$PROJECT_COUNT" -eq 0 ]; then
    echo "   Project does not exist. Creating it now..."
    # The -f flag for curl makes it fail silently on server errors (HTTP 4xx/5xx).
    # We add -S to show the error if it fails.
    CREATE_RESPONSE=$(curl -sS -u "${SONAR_TOKEN}:" -X POST "${SONAR_URL}/api/projects/create?name=${PROJECT_NAME}&project=${PROJECT_KEY}")
    if [[ "$CREATE_RESPONSE" == *"errors"* ]]; then
        echo "❌ ERROR: Failed to create project on SonarQube."
        echo "   API Response: $CREATE_RESPONSE"
        exit 1
    fi
    echo "   ✅ Project '$PROJECT_KEY' created successfully."
else
    echo "   ✅ Project '$PROJECT_KEY' already exists. Skipping creation."
fi


# 3. Run Sonar Scanner
# --------------------------------------------------
echo "➡️  Step 2: Running sonar-scanner for project '$PROJECT_DIR'..."

# Navigate into the project directory to run the scan
cd "$PROJECT_DIR"
chmod u+w .

sonar-scanner \
  -Dsonar.projectKey="$PROJECT_KEY" \
  -Dsonar.projectName="$PROJECT_KEY" \
  -Dsonar.sources="." \
  -Dsonar.host.url="$SONAR_URL" \
  -Dsonar.token="$SONAR_TOKEN"

rm -rf .scannerwork

echo "➡️  Step 3: Waiting for project '$PROJECT_DIR' to be analyzed..."

while true; do
    ACTIVITY_RESPONSE=$(curl -s -u "${SONAR_TOKEN}:" "${SONAR_URL}/api/ce/activity?component=${PROJECT_KEY}&status=PENDING,IN_PROGRESS")
    ACTIVITY_COUNT=$(echo "$ACTIVITY_RESPONSE" | jq '.paging.total')

    if [ "$ACTIVITY_COUNT" -ne 0 ]; then
      echo "Still running waiting for another 5 seconds..."
      sleep 5
    else
        break
    fi

done

echo ""
echo "----------------------------------------"
echo "✅ All done! Analysis submitted to SonarQube."
echo "View the project dashboard at: ${SONAR_URL}/dashboard?id=${PROJECT_KEY}"
echo "----------------------------------------"

FILE_EXTENSION="cc.json.gz"
TARGET_FILE=$PROJECT_DIR.$FILE_EXTENSION


if [ -f "$TARGET_FILE" ]; then
    echo "WARNING: $TARGET_FILE already exists and will be overwritten."
    rm "$TARGET_FILE"
fi

echo "
Gathering whitespace complexity ...
==================================="
echo "whitespace_complexity,file" > ws_complexity.csv
complexity --format csv | sed 's/\,\.\//\,/' >> ws_complexity.csv
ccsh csvimport --path-column-name=file -o ws_complexity.$FILE_EXTENSION  ws_complexity.csv

echo "
Gathering Tokei metrics ...
==========================="
tokei . -o json > tokei.json
ccsh tokeiimporter tokei.json -r . -o tokei.$FILE_EXTENSION

echo "
Analyzing Git repository (for larger or older repositories this might take some minutes) ...
============================================================================================"
ccsh gitlogparser repo-scan --repo-path . -o git.$FILE_EXTENSION

echo "
Analyzing rawtext ...
==========================="
ccsh rawtextparser . -o rawtext.$FILE_EXTENSION "--exclude=node_modules"

echo "
Analyzing sonar ...
==========================="
ccsh sonarimport "$SONAR_URL" "$PROJECT_KEY" --user-token="$SONAR_TOKEN" --output-file=sonar.$FILE_EXTENSION --merge-modules=false

echo "
Combining all data ...
======================"
ccsh merge -o "$TARGET_FILE" ws_complexity.$FILE_EXTENSION git.$FILE_EXTENSION tokei.$FILE_EXTENSION rawtext.$FILE_EXTENSION sonar.$FILE_EXTENSION


    echo "
Deleting temporary files ...
============================"
rm ws_complexity.$FILE_EXTENSION git.$FILE_EXTENSION tokei.$FILE_EXTENSION tokei.json ws_complexity.csv rawtext.$FILE_EXTENSION sonar.$FILE_EXTENSION

    echo "
#########
All done.
#########
"

if [ -f $TARGET_FILE ]; then
    echo "
Created $TARGET_FILE.


Open it using CodeCharta Web Studio at https://codecharta.com/visualization/app/

Recommended defaults are:
- Area Metric: rloc
- Height Metrix: whitespace_complexity
- Color Metric: number_of_commits or weeks_with_commits"
else
    echo "Arg! Something wrent wrong :/
Please check outputs above for errors and/or enable debug mode by appending --debug at the end of command to manually check generated files."
fi
exit 0
