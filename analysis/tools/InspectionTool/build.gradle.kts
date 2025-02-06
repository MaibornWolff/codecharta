dependencies {
    implementation(project(":model"))
    implementation(project(":tools:Inquirer"))
    implementation(project(":tools:InteractiveParser"))

    implementation(libs.picocli)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    testImplementation(libs.mockk)
    testImplementation(libs.assertj.core)
}

tasks.test {
    useJUnitPlatform()
}
