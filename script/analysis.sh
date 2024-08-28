#!/bin/bash

# Run SonarScanner in the container and capture output
run_sonarscanner() {
    echo "🔍 Running SonarScanner..."
    docker run --rm \
      --network $NETWORK_NAME \
      -v "$PROJECT_BASEDIR:/usr/src" \
      sonarsource/sonar-scanner-cli \
      sonar-scanner \
      -Dsonar.projectKey=$PROJECT_KEY \
      -Dsonar.sources=/usr/src \
      -Dsonar.token=$token \
      -Dsonar.host.url="$CONTAINER_SONAR_URL"

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
      ccsh sonarimport "$CONTAINER_SONAR_URL" "$PROJECT_KEY" "--user-token=$token" "--output-file=$PROJECT_BASEDIR/sonar.cc.json" "--merge-modules=false"

    if [ $? -ne 0 ]; then
        echo "❌ CodeCharta analysis failed."
        exit 1
    fi

    echo "✅ CodeCharta analysis complete. Output stored in $PROJECT_BASEDIR/sonar.cc.json.gz"
}
