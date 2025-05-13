dependencies {
    implementation(project(":model"))
    implementation(project(":dialogProvider"))
    implementation(project(":analysers:AnalyserInterface"))

    implementation(libs.picocli)
    implementation(libs.kotter)

    implementation("io.github.bonede:tree-sitter:0.24.5")
    implementation("io.github.bonede:tree-sitter-typescript:0.21.1")
}

tasks.test {
    useJUnitPlatform()
}

repositories {
    mavenCentral()
}
