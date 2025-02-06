dependencies {
    implementation(project(":model"))
    implementation(project(":tools:Inquirer"))
    implementation(project(":filter:MergeFilter"))
    implementation(project(":tools:InteractiveParser"))
    implementation(project(":tools:PipeableParser"))

    implementation(libs.commons.lang3)
    implementation(libs.picocli)
    implementation(libs.juniversalchardet)
    implementation(libs.slf4j.simple)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    testImplementation(libs.assertj.core)
    testImplementation(libs.junit.jupiter.api)
    testImplementation(libs.mockk)
}

tasks.test {
    useJUnitPlatform()
}
