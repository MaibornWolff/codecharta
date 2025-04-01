dependencies {
    implementation(project(":model"))
    implementation(project(":analysers:tools:Inquirer"))
    implementation(project(":analysers:filters:MergeFilter"))
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":analysers:PipeableAnalyserInterface"))

    implementation(libs.picocli)
    implementation(libs.json)
    implementation(libs.gson)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    testImplementation(libs.junit.jupiter.api)

    testImplementation(libs.jsonassert)
}

tasks.test {
    useJUnitPlatform()
}
