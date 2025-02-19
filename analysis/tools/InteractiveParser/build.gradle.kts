repositories {
    mavenCentral()
}

dependencies {
    implementation(libs.kotter)
    implementation(libs.kotter.test)
    implementation(libs.picocli)

    testImplementation(libs.kotlin.test)
    testRuntimeOnly(libs.kotlin.reflect)
    testImplementation(libs.assertj.core)
    testImplementation(libs.mockk)
}
