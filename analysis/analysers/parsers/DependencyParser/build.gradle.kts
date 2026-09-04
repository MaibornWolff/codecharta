dependencies {
    implementation(project(":model"))
    implementation(project(":dialogProvider"))
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":analysers:filters:MergeFilter"))

    implementation(libs.picocli)
    implementation(libs.kotter)
    implementation(libs.kotter.test)
    implementation(libs.gson)

    implementation(libs.tree.sitter.excavation.site)
    // Queried directly for Go, PHP, Python, the Vue SFC blocks and the JavaScript bundler configs,
    // none of which TSE's dependency API covers; pinned to the versions TSE itself resolves.
    implementation(libs.tree.sitter.go)
    implementation(libs.tree.sitter.javascript)
    implementation(libs.tree.sitter.php)
    implementation(libs.tree.sitter.python)
    implementation(libs.tree.sitter.vue)

    implementation(libs.kotlinx.coroutines.core)

    testImplementation(kotlin("test"))
}

tasks.test {
    useJUnitPlatform()
}
