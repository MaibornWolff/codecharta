dependencies {
    implementation(project(":model"))
    implementation(project(":dialogProvider"))
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":analysers:filters:MergeFilter"))

    implementation(libs.picocli)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    // TreeSitter Metrics Library
    implementation("io.github.treesitter:treesitter-metrics:0.1.0")

    testImplementation(libs.jsonassert)
}

tasks.test {
    useJUnitPlatform()
}

repositories {
    mavenCentral()
}
