---
categories:
  - How-to
tags:
  - sonarimport
  - analysis
title: Automated SonarQube Analysis
---

# SonarQube & CodeCharta Automation Script

## Overview

This script automates the setup and analysis processes for SonarQube and CodeCharta on Linux and MacOS. It handles:

1. **SonarQube Project Setup**: Creates a SonarQube project and optionally resets the default 'admin' password.
2. **Source Code Analysis**: Runs SonarScanner to analyze the project's source code.
3. **CodeCharta Analysis**: Performs a CodeCharta analysis based on the scanned data.

You can choose to use default values or provide custom configurations when running the script. To skip prompts and use default values, use the `-s` flag. After execution, the script will print a reusable command with the provided configurations, which you can use next time to skip prompts.

## Configuration Variables

- **PROJECT_KEY**: A unique identifier for the project in SonarQube. Default: `maibornwolff-gmbh_codecharta_visualization`
- **PROJECT_NAME**: The name of the project in SonarQube. Default: `CodeCharta Visualization`
- **NEW_SONAR_PASSWORD**: The new password for the SonarQube admin user. Default: `newadminpassword`
- **PROJECT_BASEDIR**: The directory containing the source code to be analyzed. Default: Path to the `visualization` directory relative to the script location.
- **HOST_SONAR_URL**: URL used by the host machine to access the SonarQube server. Default: `http://localhost:9000`
- **CONTAINER_SONAR_URL**: URL used by Docker containers to access the SonarQube server. Default: `http://sonarqube:9000`
- **DEFAULT_SONAR_USER**: Default SonarQube admin user. Default: `admin`
- **DEFAULT_SONAR_PASSWORD**: Default SonarQube admin password. Default: `admin`
- **SONARQUBE_TOKEN_NAME**: Name for the SonarQube token. Default: `codecharta_token`
- **SONARQUBE_TOKEN**: SonarQube token (initialized as empty).
- **NETWORK_NAME**: Docker network name. Default: `sonarnet`
- **SONAR_CONTAINER_NAME**: Docker container name for SonarQube. Default: `sonarqube`
- **RUN_PROJECT_CLEANUP**: Set to `true` to delete the existing SonarQube project. Default: `true`
- **RUN_SONAR_SCANNER**: Set to `true` to run SonarScanner. Default: `true`
- **RUN_FINAL_CLEANUP**: Set to `true` to run the final cleanup of Docker containers and networks. Default: `false`
- **TIMEOUT_PERIOD**: Timeout period in seconds for waiting on SonarQube data processing and startup. Default: `10000`

## Script Execution

1. **Introduction**: Displays the purpose of the script and usage instructions.
2. **Prompt for Configuration**: If the `-s` flag is not used, prompts for the following:
   - Project Key
   - Project Name
   - SonarQube Admin Password
   - Directory Path for Scanning
3. **Build and Display Reusable Command**: After gathering inputs (whether via flags or prompts), the script builds a reusable command reflecting the provided configurations and prints it at the end for future use.
4. **Encode Project Key and Name**: URL-encodes the project key and name for safe usage.
5. **Run Steps**:
   - Ensure SonarQube is running.
   - Reset SonarQube admin password (if required).
   - Clean up the previous SonarQube project (if configured).
   - Revoke existing token.
   - Create a new SonarQube project and generate a token.
   - Run SonarScanner for code analysis (if configured).
   - Perform CodeCharta analysis.
   - Run final cleanup (if configured).

## Usage

### Default Execution

```bash
./script/automated_sonar_analysis/run_analysis.sh
```

### Skip Prompts

```bash
./script/automated_sonar_analysis/run_analysis.sh -s
```

### Custom Execution with Flags

You can provide flags to customize the execution. For example:

```bash
./script/automated_sonar_analysis/run_analysis.sh -k "custom_project_key" -n "Custom Project Name" -p "new_password" -d "/path/to/codebase"
```

### Reusable Command

After running the script, it will display a command you can use to execute the script with the same parameters without prompting next time. This allows for easy reuse of the configurations you provided during the first run.

Example reusable command generated:

```bash
./script/automated_sonar_analysis/run_analysis.sh -k "custom_project_key" -n "Custom Project Name" -p "new_password" -d "/path/to/codebase" -u "http://localhost:9000" -t "codecharta_token"
```

This command will automatically use the values you previously provided, making future executions more efficient.

### Key Points:

- The documentation is structured using `#`, `##`, and `###` headers to clearly delineate sections.
- Code blocks for execution examples are formatted using triple backticks (` ```bash `) to ensure they are displayed correctly.
- Each command example is displayed cleanly without breaking Markdown rendering.

This format provides clarity and ease of use for the script users.
