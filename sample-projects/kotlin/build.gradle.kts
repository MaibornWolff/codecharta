plugins {
    kotlin("jvm") version "2.0.20"
}

group = "de.sots"
version = "0.1.0"

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.slf4j:slf4j-api:2.0.16")
    testImplementation(kotlin("test"))
    testImplementation("io.mockk:mockk:1.13.12")
}
