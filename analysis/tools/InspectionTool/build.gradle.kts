dependencies {
    implementation(project(":model"))
    implementation(project(":tools:Inquirer"))
    implementation(project(":tools:InteractiveParser"))

    implementation(libs.picocli)
    implementation(libs.kotter)
    implementation(libs.kotter.test)
}

tasks.test {
    useJUnitPlatform()
}
