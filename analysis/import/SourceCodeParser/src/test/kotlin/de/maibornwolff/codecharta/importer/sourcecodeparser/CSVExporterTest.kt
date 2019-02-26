package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.exporters.CSVExporter

import org.junit.Test
import java.io.File

class CSVExporterTest {

    @Test
    fun generateCSVtest() {
        val projectParser = ProjectParser()
        projectParser.scanProject(File("src/test/resources").absoluteFile, null)

        val exporter = CSVExporter()
        println(exporter.generate(projectParser.projectMetrics, projectParser.metricKinds))
    }
}