dependencies {
    implementation(project(":model"))
    implementation(project(":analysers:tools:Inquirer"))
    implementation(project(":filter:MergeFilter"))
    implementation(project(":analysers:tools:InteractiveParser"))
    implementation(project(":analysers:tools:PipeableParser"))

    implementation(libs.picocli)
    implementation(libs.json)
    implementation(libs.gson)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    testImplementation(libs.junit.jupiter.api)

    testImplementation(libs.jsonassert)
}

tasks.test {
    useJUnitPlatform()
}
