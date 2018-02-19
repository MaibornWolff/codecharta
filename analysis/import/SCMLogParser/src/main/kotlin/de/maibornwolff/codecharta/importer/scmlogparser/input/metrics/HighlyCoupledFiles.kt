package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification

class HighlyCoupledFiles : Metric {

    private val simultaneouslyCommitedFiles = mutableMapOf<String, Long>()
    private var numberOfCommits: Long = 0

    override fun description(): String {
        return "Highly Coupled Files: Number of highly coupled files (35% times modified the same time) with this file."
    }

    override fun metricName(): String {
        return "highly_coupled_files"
    }

    override fun value(): Number {
        return simultaneouslyCommitedFiles.values
                .filter { this.isHighlyCoupled(it) }
                .count()
                .toLong()
    }

    private fun isHighlyCoupled(`val`: Long): Boolean {
        return if (numberOfCommits >= MIN_NO_COMMITS_FOR_HIGH_COUPLING) {
            `val`.toDouble() / numberOfCommits.toDouble() > HIGH_COUPLING_VALUE
        } else false

    }

    override fun registerCommit(commit: Commit) {
        numberOfCommits++
        commit.modifications
                .forEach { simultaneouslyCommitedFiles.merge(it.filename, 1L) { x, y -> x + y } }
    }

    override fun registerModification(modification: Modification) {
        // delete this file
        simultaneouslyCommitedFiles.remove(modification.filename)
    }

    companion object {
        private const val HIGH_COUPLING_VALUE = .35
        private const val MIN_NO_COMMITS_FOR_HIGH_COUPLING = 5L
    }
}
