import org.jetbrains.kotlin.gradle.dsl.KotlinJvmProjectExtension
import org.jlleitschuh.gradle.ktlint.KtlintExtension
import org.sonarqube.gradle.SonarExtension

buildscript {
  repositories {
    mavenCentral()
    maven(url = "https://plugins.gradle.org/m2/")
    maven(url = "https://jitpack.io")
  }
}

plugins {
  id("distribution")
  alias(libs.plugins.kotlin.jvm)
  alias(libs.plugins.sonarqube)
  alias(libs.plugins.ktlint)
}

allprojects {
  group = "de.maibornwolff.codecharta"
  version = property("currentVersion") as String

  repositories {
    addAll(rootProject.buildscript.repositories)
  }

  apply(plugin = "jacoco")
  apply(plugin = rootProject.libs.plugins.sonarqube.get().pluginId)

  configure<JacocoPluginExtension> {
    toolVersion = rootProject.libs.versions.jacoco.get()
  }
}

subprojects {
  apply(plugin = "kotlin")
  apply(plugin = rootProject.libs.plugins.ktlint.get().pluginId)

  dependencies {
    implementation("io.github.oshai:kotlin-logging-jvm:6.0.9")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    testImplementation(rootProject.libs.junit.jupiter.api)
    testImplementation(rootProject.libs.junit.jupiter.engine)
    testImplementation(rootProject.libs.junit.jupiter.params)
  }

  tasks.test {
    testLogging {
      events("passed", "skipped", "failed")
    }
    finalizedBy(tasks.named("jacocoTestReport"))
  }

  tasks.named("jacocoTestReport") {
    dependsOn(tasks.named("test"))
  }

  configure<KotlinJvmProjectExtension> {
    jvmToolchain(11)
  }

  configure<KtlintExtension> {
    additionalEditorconfig.set(mutableMapOf("max_line_length" to "300"))
  }
}

distributions {
  main {
    distributionBaseName = "codecharta-analysis"
    contents {
      from("../LICENSE.md")
      from("CHANGELOG.md")
      from("README.md")

      project.subprojects.forEach { subproject ->
        subproject.plugins.withType(ApplicationPlugin::class.java) {
          into("bin") {
            subproject.tasks.findByName("startScripts").let {
              from(it!!.outputs.files) {
                fileMode = 755
              }
            }
          }
          into("lib") {
            subproject.tasks.findByName("jar").let {
              from(it!!.outputs.files)
            }
          }
        }
      }

      // deprecated ccsh
      from("dist/ccsh")
    }
  }
}

tasks.register<Exec>("integrationTest") {
  if ((System.getProperties().getProperty("os.name") as String).lowercase().contains("windows")) {
    println("In order to run the integration tests a bash script is executed.")
    println("Make sure to use a shell with bash capability (e.g. GitBash) to run this task.")
    executable("cmd")
    workingDir("test")
    args("/c", "bash -c './golden_test.sh $version'")
  } else {
    executable("sh")
    workingDir("test")
    args("-c", "./golden_test.sh $version")
  }
}

tasks.named<JacocoReport>("jacocoTestReport") {
  dependsOn(tasks.build, rootProject.subprojects.map { it.tasks.named("jacocoTestReport") })

  executionData.setFrom(
    fileTree(project.rootDir) {
      include("**/build/jacoco/*.exec")
    },
  )

  project.subprojects.forEach {
    sourceSets(it.sourceSets.getByName("main"))
  }

  reports {
    xml.required.set(true)
    html.required.set(false)
  }

  classDirectories.setFrom(
    files(
      classDirectories.files.map {
        fileTree(it) {
          exclude("**/AttributeDescriptors**")
        }
      },
    ),
  )
}

configure<SonarExtension> {
  properties {
    property("sonar.coverage.jacoco.xmlReportPaths", "${project.rootDir}/build/reports/jacoco/test/jacocoTestReport.xml")
    property("sonar.exclusions", "**/*AttributeDescriptors*")
  }
}

tasks.named("sonar") {
  dependsOn("build", "jacocoTestReport")
}
