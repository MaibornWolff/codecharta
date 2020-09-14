package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.Edge

// TODO track all renames to preserve coupling, preprocessing to prevent exponential growth
// file named A -> renamed to B, created named file A (bug)
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
            .filter { isHighlyCoupled(it) }
            .count()
            .toLong()
    }

    override fun getEdges(): List<Edge> {
        evaluateIfNecessary()

        return simultaneouslyCommittedFiles
            .filter { isHighlyCoupled(it.value) }
            .map { (coupledFile, value) ->
                Edge(fileName, coupledFile, mapOf(edgeMetricName() to value.toDouble() / numberOfCommits.toDouble()))
            }
    }

    private fun evaluateIfNecessary() {
        if (simultaneouslyCommittedFiles.isNotEmpty()) return

        commits.forEach { commit ->
            commit.modifications
                    .filter { it.currentFilename != fileName }
                    .forEach { simultaneouslyCommittedFiles.merge(it.currentFilename, 1) { x, y -> x + y } }
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
