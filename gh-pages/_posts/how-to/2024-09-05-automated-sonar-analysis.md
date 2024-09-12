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
   - Reset SonarQube admin password.
   - Clean up the previous SonarQube project.
   - Revoke existing token.
   - Create a new SonarQube project and generate a token.
   - Run SonarScanner for code analysis.
   - Perform CodeCharta analysis.
   - Run final cleanup.

## Usage

### Parameters

| Parameter               | Description                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------- |
| `-k <project_key>`      | Set the project key for SonarQube.                                                 |
| `-n <project_name>`     | Set the project name for SonarQube.                                                |
| `-p <new_password>`     | Set the new SonarQube admin password.                                              |
| `-d <project_basedir>`  | Set the directory containing the project to be scanned.                            |
| `-u <host_sonar_url>`   | Set the URL for the SonarQube host.                                                |
| `-t <sonar_token_name>` | Set the token name for SonarQube authentication.                                   |
| `-s`                    | Skip all prompts and use either default values or the flags passed in the command. |
| `-h`                    | Show the help message for the script and exit.                                     |

> **USAGE:**
>
> ```shell
> run_analysis.sh [-h] [-s] [-k <project_key>] [-n <project_name>] [-p <new_password>] [-d <project_basedir>] [-u <host_sonar_url>] [-t <sonar_token_name>]
> ```

### Default Execution

These commands assume you are in the root of the project.
For MacOS users, you should have brew installed and bash updated.

```shell
# For MacOS you need to give execution permission to the script
chmod +x ./script/automated_sonar_analysis/run_analysis.sh
```

No need to pass anything the script will prompt as needed.

```bash
./script/automated_sonar_analysis/run_analysis.sh
```

### Skip Prompts

The script will use the defaults and will not prompt at all.

```bash
./script/automated_sonar_analysis/run_analysis.sh -s
```

### Custom Execution with Flags

You can provide flags to customize the execution. In this case, it will skip the prompt and use the provided parameter.

For example:

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
