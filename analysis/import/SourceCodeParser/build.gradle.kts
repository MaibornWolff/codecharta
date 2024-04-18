dependencies {
  implementation(project(":model"))
  implementation(project(":filter:MergeFilter"))
  implementation(project(":tools:InteractiveParser"))
  implementation(project(":tools:PipeableParser"))

  implementation(libs.picocli)
  implementation(libs.sonar.java.plugin)
  implementation(libs.json)
  implementation(libs.kotlin.reflect)
  implementation(libs.jaxb.api)

  implementation(libs.slf4j.simple)
  implementation(libs.kotlin.inquirer)

  testImplementation(libs.junit.jupiter.api)
  testImplementation(libs.assertj.core)
  testImplementation(libs.mockito.kotlin)
  testImplementation(libs.mockito.core)
  testImplementation(libs.mockk)
}

tasks.test {
  useJUnitPlatform()
}
