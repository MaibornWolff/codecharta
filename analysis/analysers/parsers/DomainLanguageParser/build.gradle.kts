dependencies {
    implementation(project(":model"))
    implementation(project(":dialogProvider"))
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":analysers:filters:MergeFilter"))

    implementation(libs.picocli)
    implementation(libs.gson)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    // TreesitterLibrary provides all TreeSitter dependencies (aligned to UnifiedParser's v0.12.0
    // to avoid a duplicate-class clash on the shared ccsh runtime classpath).
    implementation("com.github.MaibornWolff:TreeSitterExcavationSite:v0.12.0")

    // Identifier casing splitter — no codecharta equivalent, kept long-term.
    implementation("net.pearx.kasechange:kasechange:1.4.1")

    // Runtime JSON parsing of package.json for framework detection (no @Serializable classes, so the
    // kotlin-serialization compiler plugin is not needed).
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")

    testImplementation(kotlin("test"))
}

tasks.test {
    useJUnitPlatform()
}
