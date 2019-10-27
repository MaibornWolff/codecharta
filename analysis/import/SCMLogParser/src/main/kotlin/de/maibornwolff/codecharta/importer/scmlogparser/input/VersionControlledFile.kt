package de.maibornwolff.codecharta.importer.scmlogparser.input

import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.Metric
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.model.Edge
import java.util.*

class VersionControlledFile internal constructor(
        filename: String,
        private val metrics: List<Metric>
) {

    // actual filename
    val actualFilename: String
    val authors = mutableSetOf<String>()

    // current filename in a specific revision, might change in history
    var filename: String
        private set
    private var markedDeleted = false

    val metricsMap: Map<String, Number>
        get() = metrics.associateBy({ it.metricName() }, { it.value() })

    constructor(filename: String, metricsFactory: MetricsFactory): this(filename, metricsFactory.createMetrics())

    internal constructor(
            filename: String,
            vararg metrics: Metric
    ): this(filename, Arrays.asList<Metric>(*metrics))

    init {
        this.filename = filename
        this.actualFilename = filename
    }

    /**
     * registers commits in anti-chronological order
     */
    fun registerCommit(commit: Commit) {
        val modification = commit.getModification(filename)
        metrics.forEach { it.registerCommit(commit) }
        authors.add(commit.author)
        registerModification(modification)
    }

    private fun registerModification(modification: Modification) {
        val type = modification.type
        when (type) {
            Modification.Type.DELETE -> markedDeleted = true
            Modification.Type.RENAME -> filename = modification.oldFilename
            else                     -> {
            }
        }
        metrics.forEach { it.registerModification(modification) }
    }

    fun markedDeleted(): Boolean {
        return markedDeleted
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
}
