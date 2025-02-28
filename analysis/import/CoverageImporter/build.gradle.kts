dependencies {
    implementation(project(":model"))
    implementation(project(":tools:Inquirer"))
    implementation(project(":tools:InteractiveParser"))
    implementation(project(":tools:PipeableParser"))

    implementation(libs.picocli)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    testImplementation(libs.junit.jupiter.api)
    testImplementation(libs.kotlin.test)

    testRuntimeOnly(libs.kotlin.reflect)
}

tasks.test {
    useJUnitPlatform()
}
