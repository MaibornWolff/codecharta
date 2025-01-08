dependencies {
    implementation(project(":model"))
    implementation(project(":tools:InteractiveParser"))
    implementation(project(":tools:Inquirer"))

    implementation(libs.kotter)
    implementation(libs.kotter.test)
    implementation(libs.picocli)
    testImplementation(libs.kotlin.test)

    testRuntimeOnly(libs.kotlin.reflect)
}

tasks.test {
    useJUnitPlatform()
}
