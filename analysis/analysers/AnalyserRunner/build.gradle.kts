dependencies {
    implementation(project(":model"))
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":analysers:filters:MergeFilter"))

    implementation(libs.picocli)

    testImplementation(project(":analysers:parsers:RawTextParser"))
    testImplementation(project(":analysers:parsers:UnifiedParser"))
    testImplementation(project(":analysers:parsers:DependencyParser"))
    testImplementation(project(":analysers:parsers:DomainLanguageParser"))
}

tasks.test {
    useJUnitPlatform()
}
