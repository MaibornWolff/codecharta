repositories {
  mavenCentral()
}

dependencies {
  implementation(project(":model"))

  implementation(libs.kotter.test)
  implementation(libs.kotter)

  testImplementation(libs.kotlin.test)
  testImplementation(libs.assertj.core)
}

tasks.test {
  useJUnitPlatform()
}
