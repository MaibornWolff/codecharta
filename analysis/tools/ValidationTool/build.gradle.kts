dependencies {
    implementation(project(":tools:InteractiveParser"))
    implementation(project(":model"))

    implementation(libs.json.schema)
    implementation(libs.picocli)
    implementation(libs.kotlin.inquirer)

    testImplementation(libs.kotlin.test)
    testImplementation(libs.junit.jupiter.api)

    testRuntimeOnly(libs.kotlin.reflect)
}

tasks.test {
    useJUnitPlatform()
}
