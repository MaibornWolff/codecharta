dependencies {
    implementation(project(":model"))
    implementation(project(":tools:InteractiveParser"))

    implementation(libs.boon)
    implementation(libs.slf4j.simple)
    implementation(libs.picocli)
    implementation(libs.univocity.parsers)
    implementation(libs.kotlin.inquirer)

    testImplementation(libs.mockk)
    testImplementation(libs.assertj.core)
}

tasks.test {
    useJUnitPlatform()
}
