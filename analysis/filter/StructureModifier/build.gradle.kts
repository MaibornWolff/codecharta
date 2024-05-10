dependencies {
  implementation(project(":model"))
  implementation(project(":tools:InteractiveParser"))
  implementation(project(":tools:Inquirer"))

  implementation(libs.picocli)
  implementation(libs.kotlin.inquirer)
  implementation(libs.kotter)
  implementation(libs.kotter.test)

  testImplementation(libs.kotlin.test)
  testImplementation(libs.junit.jupiter.api)
  testImplementation(libs.assertj.core)
  testImplementation(libs.mockk)
}

tasks.test {
  useJUnitPlatform()
}
