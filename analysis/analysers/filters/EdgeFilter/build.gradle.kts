dependencies {
    implementation(project(":model"))
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":DialogProvider"))

    implementation(libs.univocity.parsers)
    implementation(libs.picocli)
    implementation(libs.boon)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    testImplementation(libs.kotlin.test)

    testRuntimeOnly(libs.kotlin.reflect)
}

tasks.test {
    useJUnitPlatform()
}
