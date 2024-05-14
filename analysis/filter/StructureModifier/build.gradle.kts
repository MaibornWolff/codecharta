dependencies {
  implementation(project(":model"))
  implementation(project(":tools:InteractiveParser"))

  implementation(libs.picocli)
  implementation(libs.kotlin.inquirer)

  testImplementation(libs.kotlin.test)
  testImplementation(libs.junit.jupiter.api)
  testImplementation(libs.assertj.core)
  testImplementation(libs.mockk)
}

tasks.test {
  useJUnitPlatform()
}
