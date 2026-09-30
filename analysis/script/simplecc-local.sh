#!/usr/bin/env bash

# simplecc-local.sh - Run simplecc.sh against the ccsh built from THIS checkout.
#
# simplecc.sh calls a globally-installed `ccsh`. This wrapper instead puts the locally
# built distribution (analysis/ccsh/build/install/ccsh/bin) first on PATH, so the
# analysis runs with the current branch state (e.g. cc.json 2.0 output).
#
# On top of simplecc.sh it runs the experimental dependencyparser and merges its
# dependency lens into the same output file. simplecc.sh leaves it out until the
# parser is no longer experimental.
#
# Build the local ccsh once:
#   cd analysis && ./gradlew :ccsh:installDist -x test
#
# Then use exactly like simplecc.sh:
#   ./script/simplecc-local.sh [OPTIONS] <FolderName> [SonarUserToken]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CCSH_BIN_DIR="$SCRIPT_DIR/../ccsh/build/install/ccsh/bin"
FILE_EXTENSION="cc.json.gz"

if [ ! -x "$CCSH_BIN_DIR/ccsh" ]; then
    echo "Error: locally built ccsh not found at $CCSH_BIN_DIR/ccsh"
    echo "Build it first:"
    echo "  (cd \"$SCRIPT_DIR/..\" && ./gradlew :ccsh:installDist -x test)"
    exit 1
fi

# The distribution targets Java 17-21; honor an existing JAVA_HOME, otherwise fall back
# to a local JDK 21 if one is present (the gradle launcher uses JAVA_HOME when set).
if [ -z "${JAVA_HOME:-}" ] && [ -d /usr/lib/jvm/java-21-openjdk-arm64 ]; then
    export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-arm64
fi

export PATH="$(cd "$CCSH_BIN_DIR" && pwd):$PATH"

PROJECT_DIR=""
LEAF_MERGE=false

# Mirrors the argument handling of simplecc.sh, which validates the arguments itself.
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -l|--leaf-merge)
                LEAF_MERGE=true
                shift
                ;;
            -s|--sonar-url)
                shift 2
                ;;
            -*)
                shift
                ;;
            *)
                if [ -z "$PROJECT_DIR" ]; then
                    PROJECT_DIR="$1"
                fi
                shift
                ;;
        esac
    done
}

run_dependency_analysis() {
    local target_file=$1
    local temp_dir
    temp_dir=$(mktemp -d)
    trap "rm -rf '$temp_dir'" EXIT

    echo ""
    echo "Dependency Analysis (experimental)"
    echo "=================================="

    if ! (cd "$PROJECT_DIR" && ccsh dependencyparser . -o "$temp_dir/dependency.${FILE_EXTENSION}"); then
        echo "   Skipping: ccsh dependencyparser failed"
        return
    fi

    local merge_args=("-o" "$temp_dir/merged.${FILE_EXTENSION}")
    if $LEAF_MERGE; then
        merge_args+=("--leaf")
    fi
    merge_args+=("$target_file" "$temp_dir/dependency.${FILE_EXTENSION}")

    if ccsh merge "${merge_args[@]}"; then
        mv "$temp_dir/merged.${FILE_EXTENSION}" "$target_file"
        echo "   Merged the dependency lens into $target_file"
    else
        echo "   Skipping: merging the dependency lens failed"
    fi
}

main() {
    echo "Using local ccsh: $(command -v ccsh)"
    parse_arguments "$@"

    if [ -z "$PROJECT_DIR" ] || [[ " $* " =~ \ (-h|--help)\  ]]; then
        exec "$SCRIPT_DIR/simplecc.sh" "$@"
    fi

    "$SCRIPT_DIR/simplecc.sh" "$@"

    local target_file
    target_file="$(pwd)/$(basename "$(cd "$PROJECT_DIR" && pwd)").${FILE_EXTENSION}"
    if [ ! -f "$target_file" ]; then
        echo "Skipping dependency analysis: $target_file was not created"
        exit 1
    fi

    run_dependency_analysis "$target_file"
}

main "$@"
