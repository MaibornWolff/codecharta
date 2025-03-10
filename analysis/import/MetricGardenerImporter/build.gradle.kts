dependencies {
    implementation(project(":model"))
    implementation(project(":tools:Inquirer"))
    implementation(project(":tools:InteractiveParser"))

    implementation(libs.rxjava2)
    implementation(libs.jersey.client)
    implementation(libs.gson)
    implementation(libs.picocli)
    implementation(libs.kotter)
    implementation(libs.kotter.test)
    implementation(libs.jackson.base)
    implementation(libs.jackson.dataformat.xml)
    implementation(libs.jackson.module.kotlin)
    implementation(libs.jersey.hk2)
    implementation(libs.javax.activation)
    implementation(libs.slf4j.simple)

    testImplementation(libs.junit.jupiter.api)

    testImplementation(libs.wiremock)
}

tasks.test {
    useJUnitPlatform()
}
