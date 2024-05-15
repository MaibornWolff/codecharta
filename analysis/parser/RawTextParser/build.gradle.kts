dependencies {
    implementation(project(":model"))
    implementation(project(":filter:MergeFilter"))
    implementation(project(":tools:InteractiveParser"))
    implementation(project(":tools:PipeableParser"))

    implementation(libs.picocli)
    implementation(libs.json)
    implementation(libs.gson)
    implementation(libs.kotlin.inquirer)

    testImplementation(libs.junit.jupiter.api)
    testImplementation(libs.assertj.core)
    testImplementation(libs.mockk)
    testImplementation(libs.jsonassert)
}

tasks.test {
    useJUnitPlatform()
}
