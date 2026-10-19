dependencies {
    implementation(project(":model"))
    implementation(project(":dialogProvider"))
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":analysers:filters:MergeFilter"))
    implementation(project(":analysers:parsers:RawTextParser"))
    implementation(project(":analysers:parsers:UnifiedParser"))
    implementation(project(":analysers:parsers:DependencyParser"))
    implementation(project(":analysers:parsers:DomainLanguageParser"))
    implementation(project(":analysers:parsers:GitLogParser"))
    implementation(project(":analysers:parsers:SVNLogParser"))

    implementation(libs.picocli)
    implementation(libs.kotter)

    testImplementation(libs.kotter.test)
}

tasks.test {
    useJUnitPlatform()
}
