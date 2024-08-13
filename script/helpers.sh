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
    response=$(curl -u $DEFAULT_SONAR_USER:$DEFAULT_SONAR_PASSWORD -X GET -s "$HOST_SONAR_URL/api/authentication/validate")
    is_valid=$(echo "$response" | jq -r '.valid')

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
        echo "ℹ️ Default password does not need to be changed or has already been changed."
    fi
}

# Function to generate a token for SonarScanner
generate_token() {
    echo "🔑 Generating token..."
    response=$(curl -u $SONAR_USER:$SONAR_PASSWORD -X POST -s -w "\n%{http_code}" "$HOST_SONAR_URL/api/user_tokens/generate?name=$TOKEN_NAME")
    http_status=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n-1)
    check_response $http_status "$response_body" "Token generation failed."
    token=$(echo "$response_body" | jq -r '.token')
    if [[ -z "$token" || "$token" == "null" ]]; then
        echo "❌ Failed to generate token."
        exit 1
    fi
    echo "✅ Token generated: $token"
    echo "Token response:"
    echo "$response_body" | jq '.'
}
