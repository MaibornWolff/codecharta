dependencies {
  implementation(project(":tools:InteractiveParser"))
  implementation(project(":model"))

  implementation(libs.json.schema)
  implementation(libs.picocli)
  implementation(libs.kotlin.inquirer)

  testImplementation(libs.kotlin.test)
  testImplementation(libs.assertj.core)
  testImplementation(libs.mockk)

  testRuntimeOnly(libs.kotlin.reflect)
}

tasks.test {
  useJUnitPlatform()
}
