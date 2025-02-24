dependencies {
    implementation(project(":model"))
    implementation(project(":tools:InteractiveParser"))
    implementation(project(":import:CSVImporter"))

    implementation(libs.univocity.parsers)
    implementation(libs.picocli)
    implementation(libs.boon)
    implementation(libs.slf4j.simple)
    implementation(libs.kotlin.inquirer)

    testImplementation(libs.junit.jupiter.api)
    testImplementation(libs.kotlin.test)
    testImplementation(libs.jsonassert)

    testRuntimeOnly(libs.kotlin.reflect)
}

tasks.test {
    useJUnitPlatform()
}
