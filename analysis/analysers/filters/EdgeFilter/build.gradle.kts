dependencies {
    implementation(project(":model"))
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":dialogProvider"))

    // EdgeFilter passes the model's opaque lenses (Map<String, com.google.gson.JsonElement>) through the rebuild.
    implementation(libs.gson)
    implementation(libs.univocity.parsers)
    implementation(libs.picocli)
    implementation(libs.boon)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    testImplementation(libs.kotlin.test)

    testRuntimeOnly(libs.kotlin.reflect)
}

tasks.test {
    useJUnitPlatform()
}
