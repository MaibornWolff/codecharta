dependencies {
    implementation(libs.gson)
    implementation(libs.kotlin.reflect)
    implementation(project(":analysers:tools:PipeableParser"))

    implementation(libs.picocli)
    implementation(libs.slf4j.simple)
    implementation(libs.commons.text)

    testImplementation(libs.kotlin.test)
    testImplementation(libs.junit.jupiter.api)

    testImplementation(libs.jsonassert)
    testImplementation(libs.commons.text)
    testImplementation(project(":analysers:tools:PipeableParser"))

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
