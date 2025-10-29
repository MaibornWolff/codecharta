dependencies {
    implementation(project(":model:"))

    implementation(libs.kotter)
    implementation(libs.picocli)
}

tasks.test {
    useJUnitPlatform()
}

repositories {
    mavenCentral()
}
