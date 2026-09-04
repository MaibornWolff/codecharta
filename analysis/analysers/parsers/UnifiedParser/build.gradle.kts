dependencies {
    implementation(project(":model"))
    implementation(project(":dialogProvider"))
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":analysers:filters:MergeFilter"))

    implementation(libs.picocli)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    // TreesitterLibrary provides all TreeSitter dependencies and metric calculation
    implementation(libs.tree.sitter.excavation.site)

    testImplementation(libs.jsonassert)
}

tasks.test {
    useJUnitPlatform()
}
