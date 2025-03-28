dependencies {
    implementation(project(":model"))
    implementation(project(":analysers:tools:InteractiveParser"))
    implementation(project(":analysers:tools:Inquirer"))

    implementation(libs.kotter)
    implementation(libs.kotter.test)
    implementation(libs.picocli)
    testImplementation(libs.kotlin.test)

    testRuntimeOnly(libs.kotlin.reflect)
}

tasks.test {
    useJUnitPlatform()
}
