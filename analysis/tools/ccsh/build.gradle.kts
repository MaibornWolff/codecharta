plugins {
  application
}

application {
  applicationName = "ccsh"
  mainClass = "de.maibornwolff.codecharta.tools.ccsh.Ccsh"
}

dependencies {
  implementation(project(":model"))

  val projects =
    listOf(
      ":import:CodeMaatImporter", ":import:CSVImporter", ":filter:StructureModifier",
      ":import:SVNLogParser", ":import:GitLogParser", ":import:SonarImporter",
      ":import:SourceCodeParser", ":import:TokeiImporter", ":filter:MergeFilter",
      ":filter:EdgeFilter", ":tools:ValidationTool", ":export:CSVExporter",
      ":parser:RawTextParser", ":tools:InteractiveParser", ":tools:PipeableParser",
      ":import:MetricGardenerImporter",
    )

  projects.forEach {
    val projectDependency = project(it)
    implementation(projectDependency)
  }

  implementation(libs.picocli)
  implementation(libs.kotlin.inquirer)

  testImplementation(libs.junit.jupiter.api)
  testImplementation(libs.assertj.core)
  testImplementation(libs.mockk)
  testImplementation(libs.junit.platform.runner)
}

tasks.jar {
  archiveBaseName.set(application.applicationName)
  duplicatesStrategy = DuplicatesStrategy.EXCLUDE
  manifest {
    attributes(
      "Main-Class" to application.mainClass,
      "Implementation-Title" to "CodeCharta ccsh",
      "Implementation-Version" to project.version,
    )
  }
  isZip64 = true
  exclude("META-INF/*.RSA", "META-INF/*.SF", "META-INF/*.DSA")
  from({
    configurations.runtimeClasspath.get().filter { it.isDirectory }.plus(
      configurations.runtimeClasspath.get().files.map { zipTree(it) },
    )
  })
}

tasks.named<CreateStartScripts>("startScripts") {
  doLast {
    windowsScript.writeText(
      windowsScript
        .readText()
        .replace(Regex("set CLASSPATH=.*"), "set CLASSPATH=.;%APP_HOME%/lib/*"),
    )
    unixScript.writeText(
      unixScript
        .readText()
        .replace(Regex("DEFAULT_JVM_OPTS=.*"), "")
        .replace("#!/usr/bin/env sh", ""),
    )
  }
}

tasks.named<Test>("test") {
  useJUnitPlatform()
}
