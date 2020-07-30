package de.maibornwolff.codecharta.importer.scmlogparser.input

import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.Metric
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.model.Edge
import java.util.Arrays

class VersionControlledFile internal constructor(
    filename: String,
    private var metrics: List<Metric>
) {

    // actual filename
    val actualFilename: String
    val authors = mutableSetOf<String>()

    // the current filename in a specific revision, might change in history
    var filename: String

    val metricsMap: Map<String, Number>
        get() = metrics.associateBy({ it.metricName() }, { it.value() })

    constructor(filename: String, metricsFactory: MetricsFactory) : this(filename, metricsFactory.createMetrics())

    internal constructor(
        filename: String,
        vararg metrics: Metric
    ) : this(filename, Arrays.asList<Metric>(*metrics))

    init {
        this.filename = filename
        this.actualFilename = filename
    }

    /**
     * registers commits in chronological order
     */
    fun registerCommit(commit: Commit, modification: Modification) {
        metrics.forEach { it.registerCommit(commit) }
        authors.add(commit.author)
        metrics.forEach { it.registerModification(modification)}
    }

    override fun toString(): String {
        return "$actualFilename with metrics $metricsMap"
    }

    fun getEdgeList(): List<Edge> {
        val edgeList = mutableListOf<Edge>()
        metrics.flatMap { it.getEdges() }
                .forEach { edge ->
                    addEdgeToEdgeList(edge, edgeList)
                }
        return edgeList
    }

    private fun addEdgeToEdgeList(edge: Edge, edgeList: MutableList<Edge>) {
        edgeList.forEach {
            if (it.toNodeName == edge.toNodeName) {
                it.attributes.toMutableMap().putAll(edge.attributes)
                return
            }
        }
        edgeList.add(edge)
    }

    fun getMetricValue(metricName: String): Number {
        return metrics.first { it.metricName() == metricName }.value()
    }

    fun removeMetricsToFreeMemory() {
        metrics = listOf()
    }
}
