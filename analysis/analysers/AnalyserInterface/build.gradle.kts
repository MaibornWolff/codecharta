dependencies {
    implementation(project(":model:"))

    implementation(libs.kotter)
    implementation(libs.picocli)
}

repositories {
    mavenCentral()
}
