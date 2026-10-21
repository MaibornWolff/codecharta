dependencies {
    implementation(project(":model"))
    implementation(project(":dialogProvider"))
    implementation(project(":analysers:AnalyserInterface"))
    implementation(project(":analysers:filters:MergeFilter"))

    implementation(libs.picocli)
    implementation(libs.kotter)
    implementation(libs.kotter.test)
    implementation(libs.gson)

    implementation(project(":treeSitterExcavationSite"))

    implementation(libs.kotlinx.coroutines.core)

    testImplementation(kotlin("test"))
}

tasks.test {
    useJUnitPlatform()
    inputs
        .dir(rootProject.file("../sample-projects/regression"))
        .withPropertyName("regressionProbes")
        .withPathSensitivity(PathSensitivity.RELATIVE)
    inputs.property("updateRegressionProbes", providers.environmentVariable("UPDATE_REGRESSION_PROBES").orElse(""))
}
