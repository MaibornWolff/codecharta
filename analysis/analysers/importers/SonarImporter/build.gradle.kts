dependencies {
    implementation(project(":model"))
    implementation(project(":analysers:Inquirer"))
    implementation(project(":analysers:filters:MergeFilter"))
    implementation(project(":analysers:AnalyserInterface"))

    implementation(libs.rxjava2)
    implementation(libs.jersey.client)
    implementation(libs.gson)
    implementation(libs.picocli)
    implementation(libs.kotter)
    implementation(libs.kotter.test)

    implementation(libs.jersey.hk2)
    implementation(libs.javax.activation)

    testImplementation(libs.junit.jupiter.api)

    testImplementation(libs.wiremock)
}

tasks.test {
    useJUnitPlatform()
}
