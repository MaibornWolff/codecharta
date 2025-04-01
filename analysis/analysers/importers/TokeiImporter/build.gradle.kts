dependencies {
    implementation(project(":model"))
    implementation(project(":analysers:tools:Inquirer"))
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":analysers:PipeableAnalyserInterface"))

    implementation(libs.picocli)
    implementation(libs.boon)
    implementation(libs.gson)
    implementation(libs.slf4j.simple)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    testImplementation(libs.junit.jupiter.api)
    testImplementation(libs.kotlin.test)

    testRuntimeOnly(libs.kotlin.reflect)
}

tasks.test {
    useJUnitPlatform()
}
