#!/bin/bash

# Run SonarScanner in the container and capture output
run_sonarscanner() {
    echo "🔍 Running SonarScanner..."
    scanner_output=$(docker run --rm --network $NETWORK_NAME \
      -e SONAR_HOST_URL="$CONTAINER_SONAR_URL" \
      -e SONAR_LOGIN="$token" \
      -v "$PROJECT_BASEDIR:/usr/src" \
      sonarsource/sonar-scanner-cli \
      sonar-scanner \
      -Dsonar.projectKey=$PROJECT_KEY \
      -Dsonar.sources=/usr/src 2>&1)

    # Display the output for debugging
    echo "$scanner_output"

    if [ $? -ne 0 ]; then
        echo "❌ SonarScanner analysis failed."
        exit 1
    fi
    echo "✅ SonarScanner analysis complete."
}

# Run CodeCharta analysis using docker run
run_codecharta_analysis() {
    echo "📊 Running CodeCharta analysis..."

    # Use the correct hostname 'sonarqube' and execute the analysis
    docker run --rm -it --network "$NETWORK_NAME" --name codecharta-analysis \
      -v "$PROJECT_BASEDIR:$PROJECT_BASEDIR" \
      -w "$PROJECT_BASEDIR" \
      codecharta/codecharta-analysis \
      ccsh sonarimport "$CONTAINER_SONAR_URL" "$PROJECT_KEY" "--user-token=$token" "--output-file=./sonar.cc.json" "--merge-modules=false"

    if [ $? -ne 0 ]; then
        echo "❌ CodeCharta analysis failed."
        exit 1
    fi

    echo "✅ CodeCharta analysis complete. Output stored in $OUTPUT_PATH"

    # List the contents of the output directory for verification
    echo "Contents of $OUTPUT_PATH:"
    ls -l "$OUTPUT_PATH"
}
