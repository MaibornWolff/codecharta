#!/usr/bin/env bash

# simplecc-local.sh - Run simplecc.sh against the ccsh built from THIS checkout.
#
# simplecc.sh calls a globally-installed `ccsh`. This wrapper instead puts the locally
# built distribution (analysis/ccsh/build/install/ccsh/bin) first on PATH, so the
# analysis runs with the current branch state (e.g. cc.json 2.0 output).
#
# Build the local ccsh once:
#   cd analysis && ./gradlew :ccsh:installDist -x test
#
# Then use exactly like simplecc.sh:
#   ./script/simplecc-local.sh [OPTIONS] <FolderName> [SonarUserToken]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CCSH_BIN_DIR="$SCRIPT_DIR/../ccsh/build/install/ccsh/bin"

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

echo "Using local ccsh: $(command -v ccsh)"
exec "$SCRIPT_DIR/simplecc.sh" "$@"
