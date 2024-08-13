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
# Step 2: Reset the password if needed
reset_sonarqube_password() {
    # Attempt to log in with the default password to check if it's still active
    response=$(curl -u $DEFAULT_SONAR_USER:$DEFAULT_SONAR_PASSWORD -X GET -s "$HOST_SONAR_URL/api/authentication/validate")
    is_valid=$(echo "$response" | jq -r '.valid')

    if [ "$is_valid" == "false" ]; then
        # The default password is still active, so we need to change it
        echo "🔄 Changing default SonarQube password..."
        change_default_password
        SONAR_USER=$DEFAULT_SONAR_USER
        SONAR_PASSWORD=$NEW_SONAR_PASSWORD
    else
        echo "ℹ️ Default password is not active, using existing credentials."
        SONAR_USER=$DEFAULT_SONAR_USER
        SONAR_PASSWORD=$DEFAULT_SONAR_PASSWORD
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
    response=$(curl -u $SONAR_USER:$SONAR_PASSWORD -X POST -s -w "\n%{http_code}" "$HOST_SONAR_URL/api/user_tokens/revoke?name=$TOKEN_NAME")
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

# Create SonarQube project
create_sonarqube_project() {
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
