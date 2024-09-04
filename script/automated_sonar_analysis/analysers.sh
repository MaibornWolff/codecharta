#!/bin/bash

# Run SonarScanner in the container and capture output
run_sonarscanner() {
    echo "🔍 Running SonarScanner..."
    docker run --rm -it \
      --network $NETWORK_NAME \
      -v "$PROJECT_BASEDIR:/usr/src" \
      -w /usr/src \
      sonarsource/sonar-scanner-cli \
      sonar-scanner \
      -Dsonar.token=$token \
      -Dsonar.host.url="$CONTAINER_SONAR_URL"

    if [ $? -ne 0 ]; then
        echo "❌ SonarScanner analysis failed."
        exit 1
    fi
    
    echo "✅ SonarScanner analysis complete."
    
    interval=2          # Check every 5 seconds
    waited=0
    echo "⏳ Waiting for the data to be fully uploaded to SonarQube..."

    while true; do
        response=$(curl -s -u $SONAR_USER:$SONAR_PASSWORD -w "\n%{http_code}" "$HOST_SONAR_URL/api/ce/component?component=$PROJECT_KEY")
        
        http_status=$(echo "$response" | tail -1)
        response_body=$(echo "$response" | head -1)

        check_response "$http_status" "$response_body" "SonarQube data processing failed."

        status=$(echo "$response_body" | jq -r '.current.status')

        if [ "$status" == "SUCCESS" ]; then
            echo -e "\n✅ Data has been fully uploaded and processed by SonarQube!"
            break
        elif [ "$waited" -ge "$TIMEOUT_PERIOD" ]; then
            echo -e "\n❌ SonarQube did not finish processing the data within $TIMEOUT_PERIOD seconds."
            exit 1
        fi

        echo -n "."
        sleep "$interval"
        waited=$((waited + interval))
    done
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
