dependencies {
    implementation(project(":model"))
    implementation(project(":analysers:tools:Inquirer"))
    implementation(project(":analysers:filters:MergeFilter"))
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":analysers:PipeableAnalyserInterface"))

    implementation(libs.commons.lang3)
    implementation(libs.picocli)
    implementation(libs.juniversalchardet)
    implementation(libs.slf4j.simple)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    testImplementation(libs.kotlin.test)
    testImplementation(libs.junit.jupiter.api)

    testRuntimeOnly(libs.kotlin.reflect)
}

tasks.test {
    useJUnitPlatform()
}
