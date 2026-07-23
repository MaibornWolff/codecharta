dependencies {
    implementation(project(":model"))
    implementation(project(":dialogProvider"))
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":analysers:filters:MergeFilter"))

    implementation(libs.picocli)
    implementation(libs.gson)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    implementation("com.github.MaibornWolff:TreeSitterExcavationSite:v0.12.0")

    implementation("net.pearx.kasechange:kasechange:1.4.1")

    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")

    testImplementation(kotlin("test"))
}

tasks.test {
    useJUnitPlatform()
}
