package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters.CSVMetricWriter

import org.junit.Test
import java.io.File
import java.io.OutputStreamWriter

class CSVMetricWriterTest {

    @Test
    fun generateCSVtest() {
        val projectParser = ProjectParser()
        projectParser.scanProject(File("src/test/resources").absoluteFile, null)

        val exporter = CSVMetricWriter(OutputStreamWriter(System.out))
        println(exporter.generate(projectParser.projectMetrics, projectParser.metricKinds))
    }
}