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

    constructor(filename: String, metricsFactory: MetricsFactory) : this(filename, metricsFactory.createMetrics())

    internal constructor(filename: String, vararg metrics: Metric) : this(filename, Arrays.asList<Metric>(*metrics))

    init {
        this.filename = filename
        addRename(filename.substringBefore("_\\0_"))
    }

    /**
     * registers commits in chronological order
     */
    fun registerCommit(commit: Commit, mod: Modification) {

        flagCommitAsMutatedIfNeeded(commit, mod)

        metrics.forEach {
            it.registerCommit(commit)
            it.registerModification(mod)
        }
        authors.add(commit.author)
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
        val edgeMap = mutableMapOf<String, Edge>()
        metrics.flatMap { it.getEdges() }
            .forEach { edge ->
                val resolvedEdge = edgeMap[edge.toNodeName]
                if (resolvedEdge != null) {
                    edge.attributes.toMutableMap().putAll(edge.attributes)
                } else {
                    edgeMap[edge.toNodeName] = edge
                }
            }
        return edgeMap.values.toList()
    }

    private fun flagCommitAsMutatedIfNeeded(commit: Commit, mod: Modification) {
        if (this.isDeleted() && (mod.isTypeModify() || mod.isTypeRename())) {
            this.mutate()
        } else if (!commit.isMergeCommit() && !this.isDeleted() && mod.isTypeAdd() && !mod.isInitialAdd()) {
            this.mutate()
        }
    }

    fun getMetricValue(metricName: String): Number {
        return metricsMap[metricName] ?: error("No element found")
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
