#!/bin/bash

# ccsh_analyze.sh - A resilient script to analyze codebases and generate CodeCharta cc.json files.
#
# This script runs multiple analysis tools and merges results. Tools that are not installed
# or not applicable (e.g., git in a non-git directory) are gracefully skipped.
#
# USAGE: ./ccsh_analyze.sh [OPTIONS] <FolderName> [SonarUserToken]
#
# See ./ccsh_analyze.sh --help for full documentation.

# --- Configuration ---
SONAR_URL="${SONAR_URL:-http://localhost:9000}"
FILE_EXTENSION="cc.json.gz"

# --- State tracking ---
declare -a SKIPPED_STEPS=()
declare -a GENERATED_FILES=()
declare -a AVAILABLE_TOOLS=()
declare -a MISSING_TOOLS=()

# --- Options ---
LEAF_MERGE=false
PROJECT_DIR=""
SONAR_TOKEN=""

# --- Help ---
show_help() {
    cat << 'EOF'
USAGE:
    ccsh_analyze.sh [OPTIONS] <FolderName> [SonarUserToken]

DESCRIPTION:
    Analyzes a codebase using multiple tools and generates a merged CodeCharta
    cc.json file. Tools that are not installed or not applicable are gracefully
    skipped, and a summary of skipped steps is shown at the end.

ARGUMENTS:
    <FolderName>      Directory to analyze (required)
    [SonarUserToken]  SonarQube user token (optional, enables SonarQube analysis)

OPTIONS:
    -h, --help        Show this help message and exit
    -l, --leaf-merge  Use leaf merge strategy instead of recursive (default)
    -s, --sonar-url   SonarQube server URL (default: http://localhost:9000)
                      Can also be set via SONAR_URL environment variable

ANALYSIS STEPS:
    The script attempts to run the following analyses:

    1. UnifiedParser    - Multi-language source code metrics (requires: ccsh)
    2. Whitespace       - Whitespace complexity metrics (requires: complexity)
    3. Tokei            - Language statistics (requires: tokei)
    4. GitLogParser     - Git commit history metrics (requires: git, git repo)
    5. RawTextParser    - Raw text metrics (requires: ccsh)
    6. SonarImporter    - SonarQube metrics (requires: sonar-scanner, token)

    Only ccsh is mandatory. All other tools are optional.

EXAMPLES:
    # Analyze a project without SonarQube
    ./ccsh_analyze.sh MyProject

    # Analyze with SonarQube integration
    ./ccsh_analyze.sh MyProject sqp_abcdef1234567890

    # Use leaf merge strategy
    ./ccsh_analyze.sh --leaf-merge MyProject

    # Custom SonarQube URL
    ./ccsh_analyze.sh --sonar-url http://sonar.example.com MyProject sqp_token

ENVIRONMENT VARIABLES:
    SONAR_URL    SonarQube server URL (overridden by --sonar-url)

OUTPUT:
    Creates <FolderName>.<FolderName>.cc.json.gz in the project directory.

TOOL INSTALLATION:
    jq             https://jqlang.org/download/
    complexity     https://github.com/thoughtbot/complexity
    tokei          https://github.com/XAMPPRocky/tokei
    ccsh           https://codecharta.com/docs/overview/getting-started#installation
    git            https://git-scm.com/
    sonar-scanner  https://docs.sonarsource.com/sonarqube-server/10.8/analyzing-source-code/scanners/sonarscanner/
EOF
}

# --- Tool detection ---
check_tool() {
    local tool=$1
    if command -v "$tool" >/dev/null 2>&1; then
        AVAILABLE_TOOLS+=("$tool")
        return 0
    else
        MISSING_TOOLS+=("$tool")
        return 1
    fi
}

check_git_repo() {
    if [ -d ".git" ] || git rev-parse --git-dir >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

skip_step() {
    local step=$1
    local reason=$2
    SKIPPED_STEPS+=("$step: $reason")
    echo "   Skipping: $reason"
}

# --- Argument parsing ---
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -l|--leaf-merge)
                LEAF_MERGE=true
                shift
                ;;
            -s|--sonar-url)
                SONAR_URL="$2"
                shift 2
                ;;
            -*)
                echo "Unknown option: $1"
                echo "Use --help for usage information."
                exit 1
                ;;
            *)
                if [ -z "$PROJECT_DIR" ]; then
                    PROJECT_DIR="$1"
                elif [ -z "$SONAR_TOKEN" ]; then
                    SONAR_TOKEN="$1"
                else
                    echo "Too many arguments."
                    echo "Use --help for usage information."
                    exit 1
                fi
                shift
                ;;
        esac
    done

    if [ -z "$PROJECT_DIR" ]; then
        echo "Error: FolderName is required."
        echo "Use --help for usage information."
        exit 1
    fi
}

# --- Main execution ---
main() {
    parse_arguments "$@"

    # Validate project directory
    if [ ! -d "$PROJECT_DIR" ]; then
        echo "Error: Directory '$PROJECT_DIR' not found."
        echo "Please run this script from the parent directory containing '$PROJECT_DIR'."
        exit 1
    fi

    # Check mandatory tool
    if ! check_tool "ccsh"; then
        echo "Error: ccsh is required but not installed."
        echo "Install from: https://codecharta.com/docs/overview/getting-started#installation"
        exit 1
    fi

    # Check optional tools
    check_tool "jq"
    check_tool "complexity"
    check_tool "tokei"
    check_tool "git"
    check_tool "sonar-scanner"

    PROJECT_KEY=$PROJECT_DIR
    PROJECT_NAME=$PROJECT_DIR
    TARGET_FILE="${PROJECT_DIR}.${FILE_EXTENSION}"

    echo ""
    echo "CodeCharta Analysis"
    echo "========================================"
    echo "  Project:        $PROJECT_NAME"
    echo "  Directory:      $PROJECT_DIR"
    echo "  Merge Strategy: $(if $LEAF_MERGE; then echo 'leaf'; else echo 'recursive'; fi)"
    echo "  Available:      ${AVAILABLE_TOOLS[*]:-none}"
    echo "  Missing:        ${MISSING_TOOLS[*]:-none}"
    if [ -n "$SONAR_TOKEN" ]; then
        echo "  SonarQube:      $SONAR_URL"
    else
        echo "  SonarQube:      disabled (no token provided)"
    fi
    echo "========================================"
    echo ""

    # Navigate into project directory
    cd "$PROJECT_DIR" || exit 1
    chmod u+w . 2>/dev/null || true

    # Clean up existing target file
    if [ -f "$TARGET_FILE" ]; then
        echo "Warning: $TARGET_FILE already exists and will be overwritten."
        rm "$TARGET_FILE"
    fi

    # --- SonarQube Analysis (optional) ---
    run_sonar_analysis

    # --- UnifiedParser (mandatory) ---
    run_unified_parser

    # --- Whitespace Complexity (optional) ---
    run_complexity_analysis

    # --- Tokei (optional) ---
    run_tokei_analysis

    # --- GitLogParser (optional) ---
    run_git_analysis

    # --- RawTextParser (mandatory with ccsh) ---
    run_rawtext_analysis

    # --- SonarImporter (optional) ---
    run_sonar_import

    # --- Merge all generated files ---
    run_merge

    # --- Cleanup ---
    run_cleanup

    # --- Summary ---
    print_summary
}

run_sonar_analysis() {
    echo ""
    echo "SonarQube Analysis"
    echo "==================="

    if ! command -v sonar-scanner >/dev/null 2>&1; then
        skip_step "SonarQube Scan" "sonar-scanner not installed"
        return
    fi

    if [ -z "$SONAR_TOKEN" ]; then
        skip_step "SonarQube Scan" "no SonarQube token provided"
        return
    fi

    if ! command -v jq >/dev/null 2>&1; then
        skip_step "SonarQube Scan" "jq not installed (required for API calls)"
        return
    fi

    echo "Checking if project '$PROJECT_KEY' exists on SonarQube..."
    PROJECT_EXISTS_RESPONSE=$(curl -s -u "${SONAR_TOKEN}:" "${SONAR_URL}/api/projects/search?projects=${PROJECT_KEY}" 2>/dev/null)

    if [ -z "$PROJECT_EXISTS_RESPONSE" ]; then
        skip_step "SonarQube Scan" "could not connect to SonarQube at $SONAR_URL"
        return
    fi

    PROJECT_COUNT=$(echo "$PROJECT_EXISTS_RESPONSE" | jq '.paging.total' 2>/dev/null)

    if [ "$PROJECT_COUNT" = "null" ] || [ -z "$PROJECT_COUNT" ]; then
        skip_step "SonarQube Scan" "invalid response from SonarQube API"
        return
    fi

    if [ "$PROJECT_COUNT" -eq 0 ]; then
        echo "   Project does not exist. Creating it now..."
        CREATE_RESPONSE=$(curl -sS -u "${SONAR_TOKEN}:" -X POST "${SONAR_URL}/api/projects/create?name=${PROJECT_NAME}&project=${PROJECT_KEY}" 2>/dev/null)
        if [[ "$CREATE_RESPONSE" == *"errors"* ]]; then
            skip_step "SonarQube Scan" "failed to create project on SonarQube"
            return
        fi
        echo "   Project '$PROJECT_KEY' created successfully."
    else
        echo "   Project '$PROJECT_KEY' already exists."
    fi

    echo "Running sonar-scanner..."
    mkdir -p /tmp/sonar-empty-binaries

    if ! sonar-scanner \
        -Dsonar.projectKey="$PROJECT_KEY" \
        -Dsonar.projectName="$PROJECT_KEY" \
        -Dsonar.sources="." \
        -Dsonar.host.url="$SONAR_URL" \
        -Dsonar.token="$SONAR_TOKEN" \
        -Dsonar.java.binaries=/tmp/sonar-empty-binaries 2>/dev/null; then
        skip_step "SonarQube Scan" "sonar-scanner failed"
        rm -rf .scannerwork 2>/dev/null
        return
    fi

    rm -rf .scannerwork 2>/dev/null

    echo "Waiting for SonarQube analysis to complete..."
    local max_attempts=60
    local attempt=0
    while [ $attempt -lt $max_attempts ]; do
        ACTIVITY_RESPONSE=$(curl -s -u "${SONAR_TOKEN}:" "${SONAR_URL}/api/ce/activity?component=${PROJECT_KEY}&status=PENDING,IN_PROGRESS" 2>/dev/null)
        ACTIVITY_COUNT=$(echo "$ACTIVITY_RESPONSE" | jq '.paging.total' 2>/dev/null)

        if [ "$ACTIVITY_COUNT" = "0" ] || [ "$ACTIVITY_COUNT" = "null" ]; then
            break
        fi
        echo "   Still running, waiting 5 seconds..."
        sleep 5
        ((attempt++))
    done

    echo "   SonarQube analysis completed."
}

run_unified_parser() {
    echo ""
    echo "UnifiedParser"
    echo "============="

    if ccsh unifiedparser . -o "unified.${FILE_EXTENSION}"; then
        GENERATED_FILES+=("unified.${FILE_EXTENSION}")
        echo "   Generated unified.${FILE_EXTENSION}"
    else
        skip_step "UnifiedParser" "ccsh unifiedparser failed"
    fi
}

run_complexity_analysis() {
    echo ""
    echo "Whitespace Complexity"
    echo "====================="

    if ! command -v complexity >/dev/null 2>&1; then
        skip_step "Whitespace Complexity" "complexity tool not installed"
        return
    fi

    echo "whitespace_complexity,file" > ws_complexity.csv
    if complexity --format csv | sed 's/,\.\//,/' >> ws_complexity.csv; then
        if ccsh csvimport --path-column-name=file -o "ws_complexity.${FILE_EXTENSION}" ws_complexity.csv; then
            GENERATED_FILES+=("ws_complexity.${FILE_EXTENSION}")
            echo "   Generated ws_complexity.${FILE_EXTENSION}"
        else
            skip_step "Whitespace Complexity" "ccsh csvimport failed"
        fi
    else
        skip_step "Whitespace Complexity" "complexity command failed"
    fi
}

run_tokei_analysis() {
    echo ""
    echo "Tokei"
    echo "====="

    if ! command -v tokei >/dev/null 2>&1; then
        skip_step "Tokei" "tokei tool not installed"
        return
    fi

    if tokei . -o json > tokei.json; then
        if ccsh tokeiimporter tokei.json -r ./ -o "tokei.${FILE_EXTENSION}"; then
            GENERATED_FILES+=("tokei.${FILE_EXTENSION}")
            echo "   Generated tokei.${FILE_EXTENSION}"
        else
            skip_step "Tokei" "ccsh tokeiimporter failed"
        fi
    else
        skip_step "Tokei" "tokei command failed"
    fi
}

run_git_analysis() {
    echo ""
    echo "Git Analysis"
    echo "============"

    if ! command -v git >/dev/null 2>&1; then
        skip_step "Git Analysis" "git not installed"
        return
    fi

    if ! check_git_repo; then
        skip_step "Git Analysis" "not a git repository"
        return
    fi

    echo "Analyzing Git repository (this might take a while for large repos)..."
    if ccsh gitlogparser repo-scan --repo-path . -o "git.${FILE_EXTENSION}"; then
        GENERATED_FILES+=("git.${FILE_EXTENSION}")
        echo "   Generated git.${FILE_EXTENSION}"
    else
        skip_step "Git Analysis" "ccsh gitlogparser failed"
    fi
}

run_rawtext_analysis() {
    echo ""
    echo "RawText Analysis"
    echo "================"

    if ccsh rawtextparser . -o "rawtext.${FILE_EXTENSION}" "--exclude=node_modules"; then
        GENERATED_FILES+=("rawtext.${FILE_EXTENSION}")
        echo "   Generated rawtext.${FILE_EXTENSION}"
    else
        skip_step "RawText Analysis" "ccsh rawtextparser failed"
    fi
}

run_sonar_import() {
    echo ""
    echo "SonarQube Import"
    echo "================"

    if ! command -v sonar-scanner >/dev/null 2>&1; then
        skip_step "SonarQube Import" "sonar-scanner not installed"
        return
    fi

    if [ -z "$SONAR_TOKEN" ]; then
        skip_step "SonarQube Import" "no SonarQube token provided"
        return
    fi

    if ccsh sonarimport "$SONAR_URL" "$PROJECT_KEY" --user-token="$SONAR_TOKEN" --output-file="sonar.${FILE_EXTENSION}" --merge-modules=false; then
        GENERATED_FILES+=("sonar.${FILE_EXTENSION}")
        echo "   Generated sonar.${FILE_EXTENSION}"
    else
        skip_step "SonarQube Import" "ccsh sonarimport failed"
    fi
}

run_merge() {
    echo ""
    echo "Merging Results"
    echo "==============="

    if [ ${#GENERATED_FILES[@]} -eq 0 ]; then
        echo "   Error: No files were generated to merge."
        return
    fi

    echo "   Merging ${#GENERATED_FILES[@]} files: ${GENERATED_FILES[*]}"

    local merge_args=("-o" "$TARGET_FILE")
    if $LEAF_MERGE; then
        merge_args+=("--leaf")
    fi
    merge_args+=("${GENERATED_FILES[@]}")

    if ccsh merge "${merge_args[@]}"; then
        echo "   Successfully created $TARGET_FILE"
    else
        echo "   Error: Merge failed"
    fi
}

run_cleanup() {
    echo ""
    echo "Cleanup"
    echo "======="

    for file in "${GENERATED_FILES[@]}"; do
        if [ -f "$file" ]; then
            rm "$file"
        fi
    done

    # Clean up intermediate files
    rm -f tokei.json ws_complexity.csv 2>/dev/null

    echo "   Removed temporary files"
}

print_summary() {
    echo ""
    echo "========================================"
    echo "Summary"
    echo "========================================"
    echo ""

    if [ -f "$TARGET_FILE" ]; then
        echo "Output: $TARGET_FILE"
        echo ""
        echo "Open it using CodeCharta Web Studio at https://codecharta.com/visualization/app/"
        echo ""
        echo "Recommended defaults:"
        echo "  - Area Metric: rloc"
        echo "  - Height Metric: whitespace_complexity"
        echo "  - Color Metric: number_of_commits or weeks_with_commits"
    else
        echo "Error: Failed to create output file."
    fi

    if [ ${#SKIPPED_STEPS[@]} -gt 0 ]; then
        echo ""
        echo "Skipped steps:"
        for step in "${SKIPPED_STEPS[@]}"; do
            echo "  - $step"
        done
    fi

    echo ""
}

# Run main
main "$@"
