dependencies {
    implementation(project(":model"))
    implementation(project(":tools:InteractiveParser"))

    implementation(libs.picocli)
    implementation(libs.kotlin.inquirer)

    testImplementation(libs.mockk)
    testImplementation(libs.assertj.core)
}

tasks.test {
    useJUnitPlatform()
}
