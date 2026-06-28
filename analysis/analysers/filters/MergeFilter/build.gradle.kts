dependencies {
    implementation(project(":model"))
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":dialogProvider"))

    // The merge resolver unions opaque lenses (Map<String, com.google.gson.JsonElement>) from the model API.
    implementation(libs.gson)
    implementation(libs.kotter)
    implementation(libs.kotter.test)
    implementation(libs.picocli)
    testImplementation(libs.kotlin.test)

    testRuntimeOnly(libs.kotlin.reflect)
}

tasks.test {
    useJUnitPlatform()
}
