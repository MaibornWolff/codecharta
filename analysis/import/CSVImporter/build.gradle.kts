dependencies {
    implementation(project(":model"))
    implementation(project(":tools:InteractiveParser"))

    implementation(libs.univocity.parsers)
    implementation(libs.picocli)
    implementation(libs.boon)
    implementation(libs.slf4j.simple)
    implementation(libs.kotlin.inquirer)

    testImplementation(libs.assertj.core)
    testImplementation(libs.junit.jupiter.api)
    testImplementation(libs.kotlin.test)
    testImplementation(libs.jsonassert)
    testImplementation(libs.mockk)

    testRuntimeOnly(libs.kotlin.reflect)
}

tasks.test {
    useJUnitPlatform()
}
