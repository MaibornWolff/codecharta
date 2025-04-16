dependencies {
    implementation(project(":model"))
    implementation(project(":dialogProvider"))
    implementation(project(":analysers:filters:MergeFilter"))
    implementation(project(":analysers:AnalyserInterface"))

    implementation(libs.picocli)
    implementation(libs.sonar.java.plugin)
    implementation(libs.json)
    implementation(libs.kotlin.reflect)
    implementation(libs.jaxb.api)

    implementation(libs.slf4j.simple)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    testImplementation(libs.junit.jupiter.api)

    testImplementation(libs.mockito.kotlin)
    testImplementation(libs.mockito.core)
}

tasks.test {
    useJUnitPlatform()
}
