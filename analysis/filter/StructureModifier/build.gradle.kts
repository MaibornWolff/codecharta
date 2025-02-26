dependencies {
    implementation(project(":model"))
    implementation(project(":tools:InteractiveParser"))
    implementation(project(":tools:InspectionTool"))

    implementation(libs.picocli)
    implementation(libs.kotlin.inquirer)

    testImplementation(libs.kotlin.test)
    testImplementation(libs.junit.jupiter.api)
}

tasks.test {
    useJUnitPlatform()
}
