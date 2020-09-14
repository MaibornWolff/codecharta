package de.maibornwolff.codecharta.importer.scmlogparserv2.input

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics.Metric
import de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.model.Edge
import java.util.Arrays

class VersionControlledFile internal constructor(
    filename: String,
    private var metrics: List<Metric>
) {

    val authors = mutableSetOf<String>()
    private val renames = mutableSetOf<String>()

    // the current filename in a specific revision, might change in history
    var filename: String

    private var deleted: Boolean = false
    private var mutated: Boolean = false

    val metricsMap: Map<String, Number>
        get() = metrics.associateBy({ it.metricName() }, { it.value() })

    constructor(filename: String, metricsFactory: MetricsFactory): this(filename, metricsFactory.createMetrics())

    internal constructor(filename: String, vararg metrics: Metric): this(filename, Arrays.asList<Metric>(*metrics))

    init {
        this.filename = filename
    }

    /**
     * registers commits in chronological order
     */
    fun registerCommit(commit: Commit, mod: Modification) {
        when (true) {
            this.isDeleted() && (mod.isTypeModify() || mod.isTypeRename()) -> this.mutate()
            !commit.isMergeCommit() && !this.isDeleted() && mod.isTypeAdd() && !mod.isInitialAdd() -> this.mutate()
        }

        // TODO improve performance - do not iterate metrics collection twice
        metrics.forEach { it.registerCommit(commit) }
        authors.add(commit.author)
        metrics.forEach { it.registerModification(mod) }
    }

    fun containsRename(rename: String): Boolean {
        return renames.contains(rename)
    }

    fun addRename(rename: String) {
        renames.add(rename)
    }

    override fun toString(): String {
        return "$filename with metrics $metricsMap"
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

    fun markDeleted() {
        deleted = true
    }

    fun unmarkDeleted() {
        deleted = false
    }

    fun isDeleted(): Boolean {
        return deleted
    }

    fun mutate() {
        mutated = true
    }

    fun resetMutation() {
        mutated = false
    }

    fun isMutated(): Boolean {
        return mutated
    }
}
