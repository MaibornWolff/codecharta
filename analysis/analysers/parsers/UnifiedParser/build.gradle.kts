dependencies {
    implementation(project(":model"))
    implementation(project(":dialogProvider"))
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":analysers:filters:MergeFilter"))

    implementation(libs.picocli)
    implementation(libs.kotter)

    implementation("io.github.bonede:tree-sitter:0.24.5")
    implementation("io.github.bonede:tree-sitter-typescript:0.21.1")
    implementation("io.github.bonede:tree-sitter-kotlin:0.3.8.1")

    testImplementation(libs.jsonassert)
}

tasks.test {
    useJUnitPlatform()
}

repositories {
    mavenCentral()
}
