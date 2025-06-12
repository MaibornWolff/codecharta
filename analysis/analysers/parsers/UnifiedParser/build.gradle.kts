dependencies {
    implementation(project(":model"))
    implementation(project(":dialogProvider"))
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":analysers:filters:MergeFilter"))

    implementation(libs.picocli)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    implementation(libs.treesitter)
    implementation(libs.treesitter.typescript)
    implementation(libs.treesitter.kotlin)

    testImplementation(libs.jsonassert)
}

tasks.test {
    useJUnitPlatform()
}

repositories {
    mavenCentral()
}
