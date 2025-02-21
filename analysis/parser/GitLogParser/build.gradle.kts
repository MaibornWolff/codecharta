dependencies {
    implementation(project(":model"))
    implementation(project(":filter:MergeFilter"))
    implementation(project(":tools:InteractiveParser"))
    implementation(project(":tools:PipeableParser"))

    implementation(libs.commons.lang3)
    implementation(libs.picocli)
    implementation(libs.juniversalchardet)
    implementation(libs.slf4j.simple)
    implementation(libs.kotlin.inquirer)

    testImplementation(libs.kotlin.test)
    testImplementation(libs.junit.jupiter.api)

    testRuntimeOnly(libs.kotlin.reflect)
}

tasks.test {
    useJUnitPlatform()
}
