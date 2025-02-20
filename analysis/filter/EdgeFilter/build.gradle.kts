dependencies {
    implementation(project(":model"))
    implementation(project(":tools:InteractiveParser"))

    implementation(libs.univocity.parsers)
    implementation(libs.picocli)
    implementation(libs.boon)
    implementation(libs.kotlin.inquirer)

    testImplementation(libs.kotlin.test)
    testImplementation(libs.assertj.core)
    testImplementation(libs.mockk)
    testImplementation(libs.junit.platform.runner)

    testRuntimeOnly(libs.kotlin.reflect)
}

tasks.test {
    useJUnitPlatform()
}
