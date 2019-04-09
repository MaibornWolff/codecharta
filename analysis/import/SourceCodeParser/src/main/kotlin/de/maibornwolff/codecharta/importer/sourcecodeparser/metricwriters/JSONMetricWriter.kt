package de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters

import de.maibornwolff.codecharta.importer.sourcecodeparser.metrics.FileMetricMap
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import java.io.Writer

class JSONMetricWriter(private val projectName: String, private val writer: Writer) :
  de.maibornwolff.codecharta.importer.sourcecodeparser.metricwriters.MetricWriter {
  private val projectBuilder = ProjectBuilder(this.projectName)

  override fun generate(metricsMap: MutableMap<String, FileMetricMap>, allMetrics: Set<String>) {

    metricsMap.forEach { addAsNode(it) }
    ProjectSerializer.serializeProject(projectBuilder.build(), writer)

  }

  private fun addAsNode(metrics: Map.Entry<String, FileMetricMap>) {

    val directory = metrics.key.substringBeforeLast("/")
    val fileName = metrics.key.substringAfterLast("/")

    // TODO: Should we put non-numeric metrics here?
    val node = MutableNode(
            fileName, attributes = metrics.value.fileMetrics
    )
    val path = PathFactory.fromFileSystemPath(directory)
    projectBuilder.insertByPath(path, node)

  }

}
