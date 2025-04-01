dependencies {
    implementation(project(":model"))
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":dialogProvider"))
    implementation(project(":analysers:tools:InspectionTool"))

    implementation(libs.picocli)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    testImplementation(libs.kotlin.test)
    testImplementation(libs.junit.jupiter.api)
}

tasks.test {
    useJUnitPlatform()
}
