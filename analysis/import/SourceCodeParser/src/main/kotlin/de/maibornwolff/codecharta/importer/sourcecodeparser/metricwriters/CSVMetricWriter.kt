package de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters

import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.FileMetrics
import java.io.Writer

class CSVMetricWriter(private val writer: Writer) : de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters.MetricWriter {

  override fun generate(metricsMap: MutableMap<String, FileMetrics>, allMetrics: Set<String>) {
    val csvOutput = StringBuilder()
      .append(generateHeader(allMetrics))
    for (entry in metricsMap) {
      val fileName = entry.key
      val fileMetrics = entry.value.getMap()

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