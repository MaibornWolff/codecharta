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
        echo "ℹ️ Docker network $NETWORK_NAME already exists."
    fi
}

# Step 1: Ensure the SonarQube container is running
ensure_sonarqube_running() {
    # Ensure the Docker network exists before running the container
    ensure_network_exists

    # Check if the SonarQube container is already running with the correct settings
    existing_container=$(docker ps -a -q -f name=$SONAR_CONTAINER_NAME)
    if [ "$existing_container" ]; then
        running_container=$(docker ps -q -f name=$SONAR_CONTAINER_NAME)
        if [ "$running_container" ]; then
            echo "ℹ️ SonarQube container is already running."
            return
        else
            echo "⚠️ SonarQube container exists but is not running. Starting it..."
            docker start $SONAR_CONTAINER_NAME
            if [ $? -ne 0 ]; then
                echo "❌ Failed to start existing SonarQube container."
                exit 1
            fi
            return
        fi
    fi

    # If no container exists, create and start a new one
    echo "🚀 Starting SonarQube container..."
    docker run -d --name $SONAR_CONTAINER_NAME --network $NETWORK_NAME -p 9000:9000 sonarqube:community

    # Wait for SonarQube to be ready only after a new container is created
    echo "⏳ Waiting for SonarQube to be ready..."
    sleep 60  # Adjust this sleep time as needed to allow SonarQube to fully start
}

reset_sonarqube_password() {
    echo "🔍 Testing SonarQube credentials: Username='$DEFAULT_SONAR_USER', Password='$DEFAULT_SONAR_PASSWORD'"

    # Attempt to log in with the default password to check if it's still active
    response=$(curl -u $DEFAULT_SONAR_USER:$DEFAULT_SONAR_PASSWORD -X GET -s -w "%{http_code}" "$HOST_SONAR_URL/api/authentication/validate")
    http_status="${response: -3}"
    is_valid=$(echo "$response" | jq -r '.valid')

    if [ "$http_status" == "200" ] && [ "$is_valid" == "true" ]; then
        echo "✅ Default credentials are valid. Proceeding to change the password..."
        change_default_password
    else
        echo "ℹ️ Default credentials are not in use. Checking the new password..."

        # Attempt to log in with the new password
        response=$(curl -u $DEFAULT_SONAR_USER:$NEW_SONAR_PASSWORD -X GET -s -w "%{http_code}" "$HOST_SONAR_URL/api/authentication/validate")
        http_status="${response: -3}"
        is_valid=$(echo "$response" | jq -r '.valid')

        if [ "$http_status" == "200" ] && [ "$is_valid" == "true" ]; then
            echo "✅ New password is valid. Proceeding with it."
            SONAR_USER=$DEFAULT_SONAR_USER
            SONAR_PASSWORD=$NEW_SONAR_PASSWORD
        else
            echo "❌ The new password is invalid. Please update the NEW_SONAR_PASSWORD in the script."
            exit 1
        fi
    fi
}

# Function to change the default password to a new password
change_default_password() {
    response=$(curl -u $DEFAULT_SONAR_USER:$DEFAULT_SONAR_PASSWORD -X POST -s -w "%{http_code}" \
        -d "login=$DEFAULT_SONAR_USER&previousPassword=$DEFAULT_SONAR_PASSWORD&password=$NEW_SONAR_PASSWORD" \
        "$HOST_SONAR_URL/api/users/change_password")

    http_status="${response: -3}"

    if [ "$http_status" == "200" ] || [ "$http_status" == "204" ]; then
        echo "✅ Password has been successfully changed to the new password."
        SONAR_USER=$DEFAULT_SONAR_USER
        SONAR_PASSWORD=$NEW_SONAR_PASSWORD
    else
        echo "❌ Failed to change the password. HTTP status code: $http_status"
        echo "Response body: ${response::-3}"
        exit 1
    fi
}

# Cleanup previous SonarQube project and token
cleanup_previous_project_and_token() {
    echo "🧹 Cleaning up previous SonarQube project and token..."

    # Delete project
    response=$(curl -u $SONAR_USER:$SONAR_PASSWORD -X POST -s -w "\n%{http_code}" "$HOST_SONAR_URL/api/projects/delete?project=$PROJECT_KEY")
    http_status=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n-1)
    if [ "$http_status" -eq 404 ]; then
        echo "ℹ️ Project not found, skipping deletion."
    elif [ -z "$http_status" ]; then
        echo "❌ Failed to connect to SonarQube. Ensure that SonarQube is running and accessible at $HOST_SONAR_URL."
        exit 1
    else
        check_response $http_status "$response_body" "Project deletion failed."
        echo "✅ Project deleted successfully."
    fi

    # Revoke token
    response=$(curl -u $SONAR_USER:$SONAR_PASSWORD -X POST -s -w "\n%{http_code}" "$HOST_SONAR_URL/api/user_tokens/revoke?name=$SONARQUBE_TOKEN_NAME")
    http_status=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n-1)
    if [ "$http_status" -eq 404 ]; then
        echo "ℹ️ Token not found, skipping revocation."
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
    http_status=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n-1)
    
    if [[ "$http_status" -eq 200 && $(echo "$response_body" | jq -r '.components | length') -gt 0 ]]; then
        echo "ℹ️ Project '$PROJECT_KEY' already exists. Skipping creation."
        return
    elif [[ "$http_status" -eq 404 ]]; then
        echo "❌ Failed: Unable to check if the project exists. The endpoint may be incorrect or deprecated."
        echo "Response: $response_body"
        exit 1
    fi

    # If the project does not exist, create it
    echo "🚀 Creating project in SonarQube..."
    response=$(curl -u $SONAR_USER:$SONAR_PASSWORD -X POST -s -w "\n%{http_code}" "$HOST_SONAR_URL/api/projects/create?project=$PROJECT_KEY&name=$PROJECT_NAME")
    http_status=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n-1)

    if [[ "$http_status" -eq 404 ]]; then
        echo "❌ Failed: Project creation failed. The endpoint may be incorrect or deprecated."
        echo "Response: $response_body"
        exit 1
    fi

    check_response $http_status "$response_body" "Project creation failed."
    echo "✅ Project created successfully."
    echo "Project creation response:"
    echo "$response_body" | jq '.'
}
