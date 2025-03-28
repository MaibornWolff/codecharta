dependencies {
    implementation(project(":model"))
    implementation(project(":analysers:tools:InteractiveParser"))
    implementation(project(":analysers:tools:Inquirer"))

    implementation(libs.univocity.parsers)
    implementation(libs.picocli)
    implementation(libs.boon)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    testImplementation(libs.kotlin.test)

    testRuntimeOnly(libs.kotlin.reflect)
}

tasks.test {
    useJUnitPlatform()
}
