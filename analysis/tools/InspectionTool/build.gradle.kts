dependencies {
    implementation(project(":model"))
    implementation(project(":tools:InteractiveParser"))

    implementation(libs.picocli)
    implementation(libs.kotlin.inquirer)
}

tasks.test {
    useJUnitPlatform()
}
