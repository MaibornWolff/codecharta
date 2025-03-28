dependencies {
    implementation(project(":model"))
    implementation(project(":analysers:tools:Inquirer"))
    implementation(project(":analysers:tools:InteractiveParser"))
    implementation(project(":analysers:tools:PipeableParser"))
    implementation(project(":analysers:filters:MergeFilter"))

    implementation(libs.picocli)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    testImplementation(libs.junit.jupiter.api)
    testImplementation(libs.kotlin.test)
    testImplementation(libs.jsonassert)

    testRuntimeOnly(libs.kotlin.reflect)
}

tasks.test {
    useJUnitPlatform()
}
