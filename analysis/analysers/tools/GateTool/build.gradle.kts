dependencies {
    implementation(project(":model"))
    implementation(project(":dialogProvider"))
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":analysers:AnalyserRunner"))
    implementation(project(":analysers:filters:MergeFilter"))
    implementation(project(":analysers:parsers:RawTextParser"))
    implementation(project(":analysers:parsers:UnifiedParser"))
    implementation(project(":analysers:parsers:DependencyParser"))
    implementation(project(":analysers:parsers:DomainLanguageParser"))

    implementation(libs.picocli)
    implementation(libs.kotter)
    implementation(libs.snakeyaml)
    implementation(libs.gson)

    testImplementation(libs.kotter.test)
}

tasks.test {
    useJUnitPlatform()
}
