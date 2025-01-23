dependencies {
    implementation(project(":model"))
    implementation(project(":tools:Inquirer"))
    implementation(project(":filter:MergeFilter"))
    implementation(project(":tools:InteractiveParser"))
    implementation(project(":tools:PipeableParser"))

    implementation(libs.commons.lang3)
    implementation(libs.picocli)
    implementation(libs.juniversalchardet)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    testImplementation(libs.junit.jupiter.api)
}

tasks.test {
    useJUnitPlatform()
}
