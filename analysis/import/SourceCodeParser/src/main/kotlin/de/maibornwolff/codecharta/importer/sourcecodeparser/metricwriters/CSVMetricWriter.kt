package de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters

import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.ProjectMetrics
import de.maibornwolff.codecharta.model.Project
import java.io.Writer

class CSVMetricWriter(private val writer: Writer) : MetricWriter {

  override fun generate(projectMetrics: ProjectMetrics, allMetrics: Set<String>, pipedProject: Project?) {
    if (pipedProject != null) {
      System.err.println("Piped input project is not supported for csv output. Please merge projects and use CSVExporter after instead.")
    }

    val csvOutput = StringBuilder()
      .append(generateHeader(allMetrics))
    for (entry in projectMetrics.projectMetrics) {
      val fileName = entry.key
      val fileMetrics = entry.value.fileMetrics

      csvOutput.append(fileName)
      for (metricName in allMetrics) {
        val metric = fileMetrics[metricName]?.toString() ?: ""
        csvOutput.append(",$metric")
      }
      csvOutput.append("\n")
    }
    writer.write(csvOutput.toString())
    writer.flush()
  }

  private fun generateHeader(allMetrics: Set<String>): String {
    val header = StringBuilder()

    header.append("file")
    for (metric in allMetrics) {
      header.append(",$metric")
    }
    header.append("\n")
    return header.toString()
  }
}