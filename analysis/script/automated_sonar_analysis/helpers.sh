#!/bin/bash

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

change_default_password() {
    echo "🔑 Checking if the default password needs to be changed..."
    
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

is_valid_token() {
    local token=$1
    if [[ "$token" =~ ^squ_[0-9a-f]{40}$ ]]; then
        return 0
    else
        return 1
    fi
}

# SonarQube never returns the value of an existing token, so only its name can be checked
token_exists() {
    response=$(curl -u $SONAR_USER:$SONAR_PASSWORD -X GET -s "$HOST_SONAR_URL/api/user_tokens/search")
    
    existing_token_name=$(echo "$response" | jq -r ".userTokens[] | select(.name == \"$SONARQUBE_TOKEN_NAME\") | .name")

    if [[ "$existing_token_name" == "$SONARQUBE_TOKEN_NAME" ]]; then
        return 0
    else
        return 1
    fi
}

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

    if token_exists; then
        echo "❌ Token '$SONARQUBE_TOKEN_NAME' already exists. Cannot retrieve the value after generation."
        exit 1
    fi

    echo "🔑 Generating token..."
    response=$(curl -u $SONAR_USER:$SONAR_PASSWORD -X POST -s "$HOST_SONAR_URL/api/user_tokens/generate?name=$SONARQUBE_TOKEN_NAME")
    
    token=$(echo "$response" | jq -r '.token')

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
    local message=$1
    local spinner="⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
    local spinner_length=${#spinner}
    local i=0

    while :; do
        i=$(( (i+1) % spinner_length ))
        echo -ne "\r\033[1;33m$message ${spinner:i:1} \033[0m"
        sleep 0.1
    done
}

stop_spinner() {
    kill "$1"
    wait "$1" 2>/dev/null
    echo -ne "\r\033[0m"
}

show_menu() {
    declare -i num_args;
    declare -a options preselected;

    num_args=$1; shift
    while (( num_args-- > 0 )); do
        options+=( "$1" )
        shift
    done
    
    num_args=$1; shift
    while (( num_args-- > 0 )); do
        preselected+=( "$1" )
        shift
    done

    local -r enter_key="" space_key=" " escape_key=$'\x1b' arrow_up="[A" arrow_down="[B"
    local selected=()
    local cursor=0
    local n_options=${#options[@]}

    for i in "${preselected[@]}"; do
        selected[$i]="1"
    done

    tput smcup
    tput clear
    tput sc

    while true; do
        tput rc
        tput ed

        printf "\n\e[1;36m Use\e[1;33m ⬆️  \ ⬇️ \e[1;36m to navigate, \e[1;33m[␣ SPACE]\e[1;36m to select/deselect, and \e[1;33m[⏎ ENTER]\e[1;36m to confirm your choices. \e[0m\n"
        for i in "${!options[@]}"; do
            if [ "$i" -eq "$cursor" ]; then
                if [[ "${selected[i]}" == "1" ]]; then
                    printf -- "-> \e[1;32m[✔] ${options[i]}\e[0m\n"
                else
                    printf -- "-> \e[1;33m[ ] ${options[i]}\e[0m\n"
                fi
            else
                if [[ "${selected[i]}" == "1" ]]; then
                    printf -- "   \e[32m[✔] ${options[i]}\e[0m\n"
                else
                    printf -- "   [ ] ${options[i]}\n"
                fi
            fi
        done

        IFS= read -rsn1 key

        if [[ $key == "$enter_key" ]]; then
            break
        elif [[ $key == "$space_key" ]]; then
            if [[ "${selected[cursor]}" == "1" ]]; then
                selected[cursor]=""
            else
                selected[cursor]="1"
            fi
        elif [[ $key == "$escape_key" ]]; then
            read -rsn2 key
            if [[ $key == "$arrow_up" ]]; then
                ((cursor--))
                if [ $cursor -lt 0 ]; then
                    cursor=$((n_options - 1))
                fi
            elif [[ $key == "$arrow_down" ]]; then
                ((cursor++))
                if [ $cursor -ge $n_options ]; then
                    cursor=0
                fi
            fi
        fi
    done

    selected_options=()
    for i in "${!options[@]}"; do
        if [[ "${selected[i]}" == "1" ]]; then
            selected_options+=("${options[i]}")
        fi
    done

    tput rmcup
}
