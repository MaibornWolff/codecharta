package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.exporters.CSVExporter
import de.maibornwolff.codecharta.importer.sourcecodeparser.exporters.JSONExporter

import org.junit.Test
import java.io.File
import java.io.OutputStreamWriter

class JSONExporterTest {

  @Test
  fun generateJSONtest() {
    val projectParser = ProjectParser()
    projectParser.scanProject(File("src/test/resources").absoluteFile, null)

    val exporter = JSONExporter("projectName", OutputStreamWriter(System.out))
    println(exporter.generate(projectParser.projectMetrics, projectParser.metricKinds))
  }
}