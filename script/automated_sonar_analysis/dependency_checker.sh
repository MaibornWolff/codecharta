#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to prompt the user for installation
prompt_install() {
    local command="$1"
    local install_command="$2"

    echo "❗️ The following command will be executed to install $command:"
    echo "$install_command"
    read -p "Do you want to proceed with the installation? [Y/n]: " -n 1 -r
    echo    # move to a new line
    # Default to 'Y' if the user presses Enter
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        echo "⚠️ Installation of $command was canceled by the user."
        exit 1
    else
        eval "$install_command"
    fi
}

# Function to install jq on Ubuntu/Debian
install_jq_ubuntu() {
    local install_command="sudo apt-get update && sudo apt-get install -y jq"
    prompt_install "jq on Ubuntu/Debian" "$install_command"
}

# Function to install jq on macOS
install_jq_macos() {
    local install_command="brew install jq"
    prompt_install "jq on macOS" "$install_command"
}

# Function to check the platform and install jq accordingly
install_jq() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Check if it's Ubuntu/Debian
        if command_exists apt-get; then
            install_jq_ubuntu
        else
            echo "⚠️ Unsupported Linux distribution. Please install jq manually."
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command_exists brew; then
            install_jq_macos
        else
            echo "⚠️ Homebrew is not installed. Please install Homebrew first."
            echo "💻 Visit https://brew.sh/ for installation instructions."
            exit 1
        fi
    else
        echo "⚠️ Unsupported OS."
        exit 1
    fi
}

# Function to check if jq is installed
check_jq() {
    if command_exists jq; then
        echo "✅ jq is already installed."
    else
        echo "❌ jq is not installed."
        install_jq
    fi
}

# Function to check if docker is installed
check_docker() {
    if command_exists docker; then
        echo "✅ Docker is already installed."
    else
        echo "❌ Docker is not installed."
        echo "💻 Please install Docker manually."
        echo "🔗 Visit https://docs.docker.com/get-docker/ for installation instructions."
        exit 1
    fi
}

# Function to ensure Docker images are pulled
docker_pull_image() {
    local image=$1
    if ! docker image inspect "$image" >/dev/null 2>&1; then
        echo "🔧 Pulling Docker image: $image..."
        docker pull "$image"
        if [ $? -ne 0 ]; then
            echo "❌ Failed to pull Docker image: $image."
            exit 1
        fi
    else
        echo "ℹ️ Docker image '$image' is already available locally."
    fi
}

# Function to ensure all necessary Docker images are available
check_docker_images() {
    echo "❗️ The script needs to pull the following Docker images if they are not already available:"
    echo "  - sonarsource/sonar-scanner-cli"
    echo "  - codecharta/codecharta-analysis"
    echo "  - sonarqube:community"
    
    read -p "❓ Do you want to proceed with pulling these images? [Y/n]: " -n 1 -r
    echo    # move to a new line
    # Default to 'Y' if the user presses Enter
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        echo "🚫 Image pulling canceled. The script cannot proceed without these images."
        exit 1
    else
        docker_pull_image "sonarsource/sonar-scanner-cli"
        docker_pull_image "codecharta/codecharta-analysis"
        docker_pull_image "sonarqube:community"
    fi
}

# Run the checks for jq and Docker
check_jq
check_docker

# Check for required Docker images
check_docker_images

echo "🎉 All dependencies are installed and required Docker images are available."
