dependencies {
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":dialogProvider"))
    implementation(project(":model"))

    implementation(libs.picocli)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    testImplementation(libs.kotlin.test)
    testImplementation(libs.junit.jupiter.api)
    testImplementation(project(":ccsh"))

    testRuntimeOnly(libs.kotlin.reflect)
}

tasks.test {
    useJUnitPlatform()
}
