#!/bin/bash

# Function to check the last operation result
check_response() {
    local http_status=$1
    local response=$2
    local error_message=$3

    if [[ "$http_status" -ne 200 && "$http_status" -ne 204 ]]; then
        case "$http_status" in
            400)
                echo "❌ Failed: $error_message (400 Bad Request)"
                ;;
            401)
                echo "❌ Failed: $error_message (401 Unauthorized)"
                ;;
            403)
                echo "❌ Failed: $error_message (403 Forbidden)"
                ;;
            404)
                echo "❌ Failed: $error_message (404 Not Found)"
                ;;
            500)
                echo "❌ Failed: $error_message (500 Internal Server Error)"
                ;;
            *)
                echo "❌ Failed: $error_message (HTTP status $http_status)"
                ;;
        esac

        echo "Response:"
        echo "$response" | jq '.'
        exit 1
    fi
}

# Function to change the default password if necessary
change_default_password() {
    echo "🔑 Checking if the default password needs to be changed..."
    
    # Attempt to authenticate with the default password
    response=$(curl -X GET -s "$HOST_SONAR_URL/api/authentication/validate")
    is_valid=$(echo "$response" | jq -r '.valid')
    echo "Response: $response"
    if [ "$is_valid" == "false" ]; then
        echo "🔄 Changing default password..."
        response=$(curl -u $DEFAULT_SONAR_USER:$DEFAULT_SONAR_PASSWORD -X POST -s \
          -d "login=$DEFAULT_SONAR_USER&previousPassword=$DEFAULT_SONAR_PASSWORD&password=$NEW_SONAR_PASSWORD" \
          "$HOST_SONAR_URL/api/users/change_password")
        
        if [ "$(echo "$response" | jq -r '.errors')" == "null" ]; then
            echo "✅ Password changed successfully."
        else
            echo "❌ Failed to change password. Response: $response"
            exit 1
        fi
    else
        echo "❗️ Default password does not need to be changed or has already been changed."
    fi
}

# Function to check if a token is valid
is_valid_token() {
    local token=$1
    if [[ "$token" =~ ^squ_[0-9a-f]{40}$ ]]; then
        return 0  # Valid token
    else
        return 1  # Invalid token
    fi
}

# Function to check if a token exists (but note: SonarQube does not return the token value once created)
token_exists() {
    response=$(curl -u $SONAR_USER:$SONAR_PASSWORD -X GET -s "$HOST_SONAR_URL/api/user_tokens/search")
    
    # Directly parse the response to check if the token exists
    existing_token_name=$(echo "$response" | jq -r ".userTokens[] | select(.name == \"$SONARQUBE_TOKEN_NAME\") | .name")

    if [[ "$existing_token_name" == "$SONARQUBE_TOKEN_NAME" ]]; then
        return 0  # Token exists
    else
        return 1  # Token does not exist
    fi
}

# Function to generate a token for SonarScanner only if it doesn't already exist
generate_token() {
    if [[ -n "$SONARQUBE_TOKEN" ]]; then
        echo "❗️ Using predefined token."
        token=$SONARQUBE_TOKEN
        if ! is_valid_token "$token"; then
            echo "❌ Predefined token is invalid."
            exit 1
        fi
        return
    fi

    echo "🔍 Checking if token '$SONARQUBE_TOKEN_NAME' already exists..."

    # Check if the token exists
    if token_exists; then
        echo "❌ Token '$SONARQUBE_TOKEN_NAME' already exists. Cannot retrieve the value after generation."
        exit 1
    fi

    # If the token does not exist, generate a new one
    echo "🔑 Generating token..."
    response=$(curl -u $SONAR_USER:$SONAR_PASSWORD -X POST -s "$HOST_SONAR_URL/api/user_tokens/generate?name=$SONARQUBE_TOKEN_NAME")
    
    # Extract the newly generated token from the response
    token=$(echo "$response" | jq -r '.token')

    # Since this is a new token, ensure it follows the correct format
    if ! is_valid_token "$token"; then
        echo "❌ Failed to generate a valid token."
        exit 1
    fi

    echo "✅ Token generated: $token"

}

urlencode() {
    local raw_str="$1"
    local encoded_str
    encoded_str=$(jq -rn --arg v "$raw_str" '$v|@uri')
    echo "$encoded_str"
}

start_spinner() {
    local message=$1  # The message to display next to the spinner
    local spinner="⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"  # Spinner animation frames
    local spinner_length=${#spinner}
    local i=0  # Spinner index

    while :; do
        i=$(( (i+1) % spinner_length ))  # Loop through spinner characters
        echo -ne "\r\033[1;33m$message ${spinner:i:1} \033[0m"  # Yellow text with spinner
        sleep 0.1  # Small delay between character updates (controls speed)
    done
}

stop_spinner() {
    kill "$1"  # Kill the spinner process
    wait "$1" 2>/dev/null  # Wait for the spinner to stop and suppress errors
    echo -ne "\r\033[0m"  # Reset any terminal color/formatting and clear line
}

