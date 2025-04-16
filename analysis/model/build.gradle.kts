dependencies {
    implementation(libs.gson)
    implementation(libs.kotlin.reflect)
    implementation(project(":analysers:AnalyserInterface"))

    implementation(libs.picocli)
    implementation(libs.slf4j.simple)
    implementation(libs.commons.text)

    testImplementation(libs.kotlin.test)
    testImplementation(libs.junit.jupiter.api)

    testImplementation(libs.jsonassert)
    testImplementation(libs.commons.text)
    testImplementation(project(":analysers:AnalyserInterface"))

    testRuntimeOnly(libs.kotlin.reflect)
}

tasks.jacocoTestReport {
    classDirectories.setFrom(
        files(
            classDirectories.files.map {
                fileTree(it) {
                    setExcludes(listOf("**/model/**"))
                }
            }
        )
    )
}

tasks.test {
    useJUnitPlatform()
}
