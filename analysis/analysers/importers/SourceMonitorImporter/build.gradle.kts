dependencies {
    implementation(project(":model"))
    implementation(project(":DialogProvider"))
    implementation(project(":analysers:importers:CSVImporter"))
    implementation(project(":analysers:AnalyserInterface"))

    implementation(libs.univocity.parsers)
    implementation(libs.picocli)
    implementation(libs.boon)
    implementation(libs.slf4j.simple)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    testImplementation(libs.junit.jupiter.api)
    testImplementation(libs.kotlin.test)
    testImplementation(libs.jsonassert)

    testRuntimeOnly(libs.kotlin.reflect)
}

tasks.test {
    useJUnitPlatform()
}
