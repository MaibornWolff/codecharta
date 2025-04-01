dependencies {
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":DialogProvider"))
    implementation(project(":model"))

    implementation(libs.json.schema)
    implementation(libs.picocli)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    testImplementation(libs.kotlin.test)
    testImplementation(libs.junit.jupiter.api)

    testRuntimeOnly(libs.kotlin.reflect)
}

tasks.test {
    useJUnitPlatform()
}
