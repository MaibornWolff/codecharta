#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install jq on Ubuntu/Debian
install_jq_ubuntu() {
    echo "🔧 Installing jq on Ubuntu/Debian..."
    sudo apt-get update
    sudo apt-get install -y jq
}

# Function to install jq on macOS
install_jq_macos() {
    echo "🔧 Installing jq on macOS..."
    brew install jq
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
        echo "⚠️ Unsupported OS. Please install jq manually."
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

# Run the checks
check_jq
check_docker

echo "🎉 All dependencies are installed."
