dependencies {
    implementation(project(":model"))
    implementation(project(":dialogProvider"))
    implementation(project(":analysers:filters:MergeFilter"))
    implementation(project(":analysers:AnalyserInterface"))

    implementation(libs.rxjava2)
    implementation(libs.jersey.client)
    implementation(libs.gson)
    implementation(libs.picocli)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    implementation(libs.jakarta.ws.rs.api)

    testImplementation(libs.junit.jupiter.api)

    testImplementation(libs.wiremock)
}

tasks.test {
    useJUnitPlatform()
}
