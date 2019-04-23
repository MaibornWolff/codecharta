package de.maibornwolff.codecharta.importer.sourcecodeparser.sonaranalyzers

import de.maibornwolff.codecharta.importer.sourcecodeparser.NullFileLinesContextFactory
import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.ProjectMetrics
import org.sonar.api.SonarQubeSide
import org.sonar.api.batch.fs.InputFile
import org.sonar.api.batch.fs.internal.TestInputFileBuilder
import org.sonar.api.batch.rule.CheckFactory
import org.sonar.api.batch.rule.internal.ActiveRulesBuilder
import org.sonar.api.batch.sensor.internal.SensorContextTester
import org.sonar.api.config.internal.MapSettings
import org.sonar.api.internal.SonarRuntimeImpl
import org.sonar.api.issue.NoSonarFilter
import org.sonar.api.utils.Version
import org.sonar.java.DefaultJavaResourceLocator
import org.sonar.java.JavaClasspath
import org.sonar.java.JavaTestClasspath
import org.sonar.java.SonarComponents
import org.sonar.java.filters.PostAnalysisIssueFilter
import org.sonar.plugins.java.Java
import org.sonar.plugins.java.JavaSquidSensor
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream
import java.nio.charset.StandardCharsets

class JavaSonarAnalyzer(verbose: Boolean = false): SonarAnalyzer(verbose) {

  override val FILE_EXTENSION = "java"
  override lateinit var baseDir: File

  // Minimal rules init
  private var activeRules = ActiveRulesBuilder().build()
  private var mapSettings = MapSettings()

  private lateinit var javaClasspath: JavaClasspath
  private lateinit var sonarComponents: SonarComponents


  override fun createContext() {
    sensorContext = SensorContextTester.create(baseDir)
    sensorContext.setRuntime(SonarRuntimeImpl.forSonarQube(Version.create(6, 0), SonarQubeSide.SERVER))
    javaClasspath = JavaClasspath(mapSettings.asConfig(), sensorContext.fileSystem())
  }

  override fun buildSonarComponents() {
    val checkFactory = CheckFactory(this.activeRules)
    val javaTestClasspath = JavaTestClasspath(mapSettings.asConfig(), sensorContext.fileSystem())
    val fileLinesContextFactory = NullFileLinesContextFactory()
    sonarComponents = SonarComponents(
      fileLinesContextFactory,
      sensorContext.fileSystem(),
      javaClasspath,
      javaTestClasspath,
      checkFactory
    )
    sonarComponents.setSensorContext(this.sensorContext)
  }

    override fun scanFiles(fileList: List<String>, root: File): ProjectMetrics {
      baseDir = root.absoluteFile
      val projectMetrics = ProjectMetrics()

      val originalOut = System.out
      if (!verbose) System.setOut(PrintStream(ByteArrayOutputStream()))

      for (file in fileList) {
        createContext()
        buildSonarComponents()
        addFileToContext(file)
        executeScan()
        val fileMetrics = retrieveMetrics(file)
        projectMetrics.addFileMetricMap(file, fileMetrics)
      }

      System.setOut(originalOut)
      return projectMetrics
  }

  override fun addFileToContext(fileName: String) {
    val inputFile = TestInputFileBuilder.create("moduleKey", fileName)
      .setModuleBaseDir(baseDir.toPath())
      .setCharset(StandardCharsets.UTF_8)
      .setType(InputFile.Type.MAIN)
      .setLanguage(Java.KEY)
      .initMetadata(fileContent(File("$baseDir/$fileName"), StandardCharsets.UTF_8))
      .build()
    sensorContext.fileSystem().add(inputFile)
  }

  override fun executeScan() {
    val javaSquidSensor = JavaSquidSensor(
      sonarComponents,
      sonarComponents.fileSystem,
      DefaultJavaResourceLocator(sonarComponents.fileSystem, javaClasspath),
      mapSettings.asConfig(),
      NoSonarFilter(),
      PostAnalysisIssueFilter(sonarComponents.fileSystem)
    )
    javaSquidSensor.execute(sensorContext)
  }
}