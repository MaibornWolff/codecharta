dependencies {
    implementation(project(":model"))
    implementation(project(":analysers:InteractiveParser"))
    implementation(project(":analysers:tools:Inquirer"))
    implementation(project(":analysers:tools:InspectionTool"))

    implementation(libs.picocli)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    testImplementation(libs.kotlin.test)
    testImplementation(libs.junit.jupiter.api)
}

tasks.test {
    useJUnitPlatform()
}
