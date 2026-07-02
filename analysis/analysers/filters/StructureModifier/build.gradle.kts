dependencies {
    implementation(project(":model"))
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":dialogProvider"))
    implementation(project(":analysers:tools:InspectionTool"))

    // Filters pass the model's opaque lenses (Map<String, com.google.gson.JsonElement>) through the rebuild.
    implementation(libs.gson)
    implementation(libs.picocli)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    testImplementation(libs.kotlin.test)
    testImplementation(libs.junit.jupiter.api)
}

tasks.test {
    useJUnitPlatform()
}
