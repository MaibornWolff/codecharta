dependencies {
    implementation(project(":model"))
    implementation(project(":filter:MergeFilter"))
    implementation(project(":tools:InteractiveParser"))
    implementation(project(":tools:PipeableParser"))

    implementation(libs.commons.lang3)
    implementation(libs.picocli)
    implementation(libs.juniversalchardet)
    implementation(libs.kotlin.inquirer)

    testImplementation(libs.junit.jupiter.api)
}

tasks.test {
    useJUnitPlatform()
}
