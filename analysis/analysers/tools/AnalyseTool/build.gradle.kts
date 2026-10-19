dependencies {
    implementation(project(":model"))
    implementation(project(":dialogProvider"))
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":analysers:AnalyserRunner"))
    implementation(project(":analysers:filters:MergeFilter"))
    implementation(project(":analysers:parsers:GitLogParser"))
    implementation(project(":analysers:parsers:SVNLogParser"))

    implementation(libs.picocli)
    implementation(libs.kotter)

    testImplementation(libs.kotter.test)
    testImplementation(project(":analysers:parsers:RawTextParser"))
    testImplementation(project(":analysers:parsers:UnifiedParser"))
}

tasks.test {
    useJUnitPlatform()
}
