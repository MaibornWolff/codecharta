dependencies {
    implementation(project(":model"))
    implementation(project(":tools:InteractiveParser"))

    implementation(libs.picocli)
    implementation(libs.kotlin.inquirer)
    testImplementation(libs.kotlin.test)

    testRuntimeOnly(libs.kotlin.reflect)
}

tasks.test {
    useJUnitPlatform()
}
