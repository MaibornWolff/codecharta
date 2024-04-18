dependencies {
  implementation(project(":model"))
  implementation(project(":filter:MergeFilter"))
  implementation(project(":tools:InteractiveParser"))

  implementation(libs.rxjava2)
  implementation(libs.jersey.client)
  implementation(libs.gson)
  implementation(libs.picocli)
  implementation(libs.kotlin.inquirer)

  implementation(libs.jersey.hk2)
  implementation(libs.javax.activation)

  testImplementation(libs.junit.jupiter.api)
  testImplementation(libs.mockk)
  testImplementation(libs.wiremock)
  testImplementation(libs.assertj.core)
}
