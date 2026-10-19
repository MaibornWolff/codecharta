dependencies {
    implementation(project(":model"))
    implementation(project(":dialogProvider"))
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":analysers:tools:AnalyseTool"))

    implementation(libs.picocli)
    implementation(libs.kotter)
    implementation(libs.snakeyaml)
    implementation(libs.gson)

    testImplementation(libs.kotter.test)
    testImplementation(project(":analysers:parsers:RawTextParser"))
    testImplementation(project(":analysers:parsers:UnifiedParser"))
    testImplementation(project(":analysers:parsers:DependencyParser"))
    testImplementation(project(":analysers:parsers:DomainLanguageParser"))
}

tasks.test {
    useJUnitPlatform()
}
