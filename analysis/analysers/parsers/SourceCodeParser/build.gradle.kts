// DEPRECATED: SourceCodeParser has been removed
// This minimal configuration keeps the module buildable for backward compatibility

dependencies {
    implementation(project(":model"))
    implementation(project(":analysers:AnalyserInterface"))
    implementation(libs.picocli)
    implementation(libs.kotter)
}
