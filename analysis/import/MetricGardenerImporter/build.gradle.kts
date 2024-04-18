dependencies {
  implementation(project(":tools:InteractiveParser"))
  implementation(project(":model"))

  implementation(libs.rxjava2)
  implementation(libs.jersey.client)
  implementation(libs.gson)
  implementation(libs.picocli)
  implementation(libs.kotlin.inquirer)
  implementation(libs.jackson.base)
  implementation(libs.jackson.dataformat.xml)
  implementation(libs.jackson.module.kotlin)
  implementation(libs.jersey.hk2)
  implementation(libs.javax.activation)
  implementation(libs.slf4j.simple)

  testImplementation(libs.junit.jupiter.api)
  testImplementation(libs.assertj.core)
  testImplementation(libs.mockk)
  testImplementation(libs.wiremock)
}

tasks.test {
  useJUnitPlatform()
}
