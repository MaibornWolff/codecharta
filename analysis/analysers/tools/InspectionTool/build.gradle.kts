dependencies {
    implementation(project(":model"))
    implementation(project(":analysers:tools:Inquirer"))
    implementation(project(":analysers:tools:InteractiveParser"))

    implementation(libs.picocli)
    implementation(libs.kotter)
    implementation(libs.kotter.test)
}

tasks.test {
    useJUnitPlatform()
}
