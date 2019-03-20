package de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters

import de.maibornwolff.codecharta.importer.sourcecodeparser.ProjectParser

import org.junit.Test
import java.io.File
import java.io.OutputStreamWriter

class JSONMetricWriterTest {

  @Test
  fun generateJSONtest() {
    val projectParser = ProjectParser()
    projectParser.scanProject(File("src/test/resources").absoluteFile, null)

    val exporter = JSONMetricWriter("projectName", OutputStreamWriter(System.out))
    println(exporter.generate(projectParser.projectMetrics, projectParser.metricKinds))
  }
}