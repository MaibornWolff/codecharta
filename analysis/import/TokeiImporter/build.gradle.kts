dependencies {
  implementation(project(":model"))
  implementation(project(":tools:InteractiveParser"))
  implementation(project(":tools:PipeableParser"))

  implementation(libs.picocli)
  implementation(libs.boon)
  implementation(libs.gson)
  implementation(libs.slf4j.simple)
  implementation(libs.kotlin.inquirer)

  testImplementation(libs.junit.jupiter.api)
  testImplementation(libs.kotlin.test)
  testImplementation(libs.assertj.core)
  testImplementation(libs.mockk)

  testRuntimeOnly(libs.kotlin.reflect)
}

tasks.test {
  useJUnitPlatform()
}
