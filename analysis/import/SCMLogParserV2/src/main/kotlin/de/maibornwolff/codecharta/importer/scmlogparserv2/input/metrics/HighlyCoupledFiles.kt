package de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Modification
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.Edge

class HighlyCoupledFiles : Metric {

    private var fileName: String = ""
    private var numberOfCommits: Long = 0
    private var commits = mutableListOf<Commit>()
    private val simultaneouslyCommittedFiles = mutableMapOf<String, Int>()

    override fun description(): String {
        return "Highly Coupled Files: Number of highly coupled files (35% times modified the same time) with this file."
    }

    override fun metricName(): String {
        return "highly_coupled_files"
    }

    override fun edgeMetricName(): String {
        return "temporal_coupling"
    }

    override fun value(): Number {
        evaluateIfNecessary()

        return simultaneouslyCommittedFiles.values
            .count { isHighlyCoupled(it) }
            .toLong()
    }

    override fun getEdges(): List<Edge> {
        evaluateIfNecessary()

        return simultaneouslyCommittedFiles
            .mapNotNull { (coupledFile, value) ->
                if (isHighlyCoupled(value)) {
                    Edge(
                        fileName,
                        coupledFile,
                        mapOf(edgeMetricName() to value.toDouble() / numberOfCommits.toDouble())
                    )
                } else
                    null
            }
    }

    private fun evaluateIfNecessary() {
        if (simultaneouslyCommittedFiles.isNotEmpty()) return

        commits.forEach { commit ->
            commit.modifications
                .forEach {
                    if (it.currentFilename != fileName) {
                        simultaneouslyCommittedFiles.merge(it.currentFilename, 1) { x, y -> x + y }
                    }
                }
        }
    }

    private fun isHighlyCoupled(value: Int): Boolean {
        return if (value >= MIN_NO_COMMITS_FOR_HIGH_COUPLING) {
            value.toDouble() / numberOfCommits.toDouble() > HIGH_COUPLING_VALUE
        } else false
    }

    override fun registerCommit(commit: Commit) {
        numberOfCommits++
        commits.add(commit)
    }

    override fun registerModification(modification: Modification) {
        fileName = modification.currentFilename
    }

    override fun edgeAttributeType(): AttributeType? {
        return AttributeType.absolute
    }

    companion object {
        private const val HIGH_COUPLING_VALUE = .35
        private const val MIN_NO_COMMITS_FOR_HIGH_COUPLING = 5L
    }
}
