dependencies {
    implementation(project(":model"))
    implementation(project(":DialogProvider"))
    implementation(project(":analysers:AnalyserInterface"))

    implementation(libs.picocli)
    implementation(libs.kotter)
    implementation(libs.kotter.test)
}

tasks.test {
    useJUnitPlatform()
}
