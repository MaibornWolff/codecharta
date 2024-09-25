#!/bin/bash

# Ensure the Docker network exists
ensure_network_exists() {
    if ! docker network inspect $NETWORK_NAME >/dev/null 2>&1; then
        echo "🔧 Creating Docker network $NETWORK_NAME..."
        docker network create $NETWORK_NAME
        if [ $? -ne 0 ]; then
            echo "❌ Failed to create Docker network $NETWORK_NAME."
            exit 1
        fi
    else
        echo "❗️ Docker network $NETWORK_NAME already exists."
    fi
}

ensure_sonarqube_running() {
    ensure_network_exists

    # Check if the SonarQube container is already running with the correct settings
    existing_container=$(docker ps -a -q -f name=$SONAR_CONTAINER_NAME)
    if [ "$existing_container" ]; then
        running_container=$(docker ps -q -f name=$SONAR_CONTAINER_NAME)
        if [ "$running_container" ]; then
            echo "❗️ SonarQube container is already running."
            wait_for_sonarqube_ready
            return
        else
            echo "🚨 SonarQube container exists but is not running. Starting it..."
            docker start $SONAR_CONTAINER_NAME
            if [ $? -ne 0 ]; then
                echo "❌ Failed to start existing SonarQube container."
                exit 1
            fi
            wait_for_sonarqube_ready
            return
        fi
    fi

    echo "🚀 Starting SonarQube container..."
    docker run -d --name $SONAR_CONTAINER_NAME --network $NETWORK_NAME -p 9000:9000 sonarqube:community

    wait_for_sonarqube_ready
}

wait_for_sonarqube_ready() {
    # Start spinner in the background with a custom message
    start_spinner "⏳ Checking SonarQube status..." &
    spinner_pid=$!

    local check_interval=2     # Time to wait between each check (in seconds)
    local elapsed_time=0       # Track the total elapsed time
    local response
    local sonarqube_status

    while [ $elapsed_time -lt $TIMEOUT_PERIOD ]; do
        response=$(curl -s -w "\n%{http_code}" "$HOST_SONAR_URL/api/system/status")

        http_status=$(echo "$response" | tail -n1)
        response_body=$(echo "$response" | head -n1)

        sonarqube_status=$(echo "$response_body" | jq -r '.status')

        if [ "$sonarqube_status" == "UP" ]; then
            stop_spinner "$spinner_pid"  # Stop spinner if SonarQube is ready
            echo -e "\n✅ SonarQube is ready!"  # Green success message
            return
        fi

        sleep $check_interval
        elapsed_time=$((elapsed_time + check_interval))
    done

    # If the loop ends without success, stop the spinner and show an error message
    stop_spinner "$spinner_pid"
    echo -e "\n❌ SonarQube did not become ready within $TIMEOUT_PERIOD seconds."  # Red error message
    exit 1
}


reset_sonarqube_password() {
    echo "🔍 Testing SonarQube credentials: Username='$DEFAULT_SONAR_USER', Password='$DEFAULT_SONAR_PASSWORD'"

    # Attempt to log in with the default password to check if it's still active
    response=$(curl -u $DEFAULT_SONAR_USER:$DEFAULT_SONAR_PASSWORD -X GET -s -w "\n%{http_code}" "$HOST_SONAR_URL/api/authentication/validate")
    http_status=$(echo "$response" | tail -1)   
    response_body=$(echo "$response" | head -1) 

    # Check if the response is valid JSON before parsing
    if echo "$response_body" | jq -e . >/dev/null 2>&1; then
        is_valid=$(echo "$response_body" | jq -r '.valid')

        if [ "$http_status" == "200" ] && [ "$is_valid" == "true" ]; then
            echo "✅ Default credentials are valid. Proceeding to change the password..."
            change_default_password
        else
            echo "❗️ Default credentials are not in use. Checking the new password..."

            # Attempt to log in with the new password
            response=$(curl -u $DEFAULT_SONAR_USER:$NEW_SONAR_PASSWORD -X GET -s -w "\n%{http_code}" "$HOST_SONAR_URL/api/authentication/validate")

            http_status=$(echo "$response" | tail -1)   
            response_body=$(echo "$response" | head -1) 

            if echo "$response_body" | jq -e . >/dev/null 2>&1; then
                is_valid=$(echo "$response_body" | jq -r '.valid')

                if [ "$http_status" == "200" ] && [ "$is_valid" == "true" ]; then
                    echo "✅ New password is valid. Proceeding with it."
                    SONAR_USER=$DEFAULT_SONAR_USER
                    SONAR_PASSWORD=$NEW_SONAR_PASSWORD
                else
                    echo "❌ The new password is invalid. Please update the NEW_SONAR_PASSWORD in the script."
                    exit 1
                fi
            else
                echo "❌ Failed to parse the response when checking the new password."
                exit 1
            fi
        fi
    else
        echo "❌ Failed to parse the response when checking the default password."
        exit 1
    fi
}

change_default_password() {
    response=$(curl -u $DEFAULT_SONAR_USER:$DEFAULT_SONAR_PASSWORD -X POST -s -w "\n%{http_code}" \
        -d "login=$DEFAULT_SONAR_USER&previousPassword=$DEFAULT_SONAR_PASSWORD&password=$NEW_SONAR_PASSWORD" \
        "$HOST_SONAR_URL/api/users/change_password")

    http_status=$(echo "$response" | tail -1)   
    response_body=$(echo "$response" | head -1) 

    if [ "$http_status" == "200" ] || [ "$http_status" == "204" ]; then
        echo "✅ Password has been successfully changed to the new password."
        SONAR_USER=$DEFAULT_SONAR_USER
        SONAR_PASSWORD=$NEW_SONAR_PASSWORD
    else
        echo "❌ Failed to change the password. HTTP status code: $http_status"
        exit 1
    fi
}


cleanup_previous_project() {
    echo "🧹 Cleaning up previous SonarQube project..."

    # Delete project
    response=$(curl -u $SONAR_USER:$SONAR_PASSWORD -X POST -s -w "\n%{http_code}" "$HOST_SONAR_URL/api/projects/delete?project=$ENCODED_PROJECT_KEY")
    http_status=$(echo "$response" | tail -1)
    response_body=$(echo "$response" | head -1)
    if [ "$http_status" -eq 404 ]; then
        echo "❗️ Project not found, skipping deletion."
    elif [ -z "$http_status" ]; then
        echo "❌ Failed to connect to SonarQube. Ensure that SonarQube is running and accessible at $HOST_SONAR_URL."
        exit 1
    else
        check_response $http_status "$response_body" "Project deletion failed."
        echo "✅ Project deleted successfully."
    fi
}

revoke_token() {
    echo "🧹 Revoking existing SonarQube token..."

    # Revoke token
    response=$(curl -u $SONAR_USER:$SONAR_PASSWORD -X POST -s -w "\n%{http_code}" "$HOST_SONAR_URL/api/user_tokens/revoke?name=$SONARQUBE_TOKEN_NAME")
    http_status=$(echo "$response" | tail -1)
    response_body=$(echo "$response" | head -1)
    if [ "$http_status" -eq 404 ]; then
        echo "❗️ Token not found, skipping revocation."
    elif [ -z "$http_status" ]; then
        echo "❌ Failed to connect to SonarQube. Ensure that SonarQube is running and accessible at $HOST_SONAR_URL."
        exit 1
    else
        check_response $http_status "$response_body" "Token revocation failed."
        echo "✅ Token revoked successfully."
    fi
}


# Create SonarQube project only if it doesn't already exist
create_sonarqube_project() {
    echo "🔍 Checking if project '$PROJECT_KEY' already exists in SonarQube..."

    # Check if the project already exists
    response=$(curl -u $SONAR_USER:$SONAR_PASSWORD -X GET -s -w "\n%{http_code}" "$HOST_SONAR_URL/api/projects/search?projects=$PROJECT_KEY")
    http_status=$(echo "$response" | tail -1)
    response_body=$(echo "$response" | head -1)
    
    if [[ "$http_status" -eq 200 && $(echo "$response_body" | jq -r '.components | length') -gt 0 ]]; then
        echo "❗️ Project '$PROJECT_KEY' already exists. Skipping creation."
        return
    elif [[ "$http_status" -eq 404 ]]; then
        echo "❌ Failed: Unable to check if the project exists. The endpoint may be incorrect or deprecated."
        echo "Response: $response_body"
        exit 1
    fi

    # If the project does not exist, create it
    echo "🚀 Creating project in SonarQube..."
    response=$(curl -u $SONAR_USER:$SONAR_PASSWORD -X POST -s -w "\n%{http_code}" "$HOST_SONAR_URL/api/projects/create?project=$ENCODED_PROJECT_KEY&name=$ENCODED_PROJECT_NAME")
    http_status=$(echo "$response" | tail -1)
    response_body=$(echo "$response" | head -1)

    if [[ "$http_status" -eq 404 ]]; then
        echo "❌ Failed: Project creation failed. The endpoint may be incorrect or deprecated."
        echo "Response: $response_body"
        exit 1
    fi

    check_response $http_status "$response_body" "Project creation failed."
    echo "✅ Project created successfully."
}
