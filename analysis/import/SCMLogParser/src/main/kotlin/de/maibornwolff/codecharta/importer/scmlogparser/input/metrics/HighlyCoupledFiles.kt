package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification

class HighlyCoupledFiles: Metric {

    private var fileName: String = ""
    private var numberOfCommits: Long = 0
    private var commits = mutableListOf<Commit>()

    override fun description(): String {
        return "Highly Coupled Files: Number of highly coupled files (35% times modified the same time) with this file."
    }

    override fun metricName(): String {
        return "highly_coupled_files"
    }

    override fun value(): Number {
        val simultaneouslyCommittedFiles = mutableMapOf<String, Int>()
        commits.forEach { commit ->
            commit.modifications
                    .filter { it.filename != fileName }
                    .forEach { simultaneouslyCommittedFiles.merge(it.filename, 1) { x, y -> x + y } }
        }

        return simultaneouslyCommittedFiles.values
                .filter { this.isHighlyCoupled(it) }
                .count()
                .toLong()
    }

    private fun isHighlyCoupled(`val`: Int): Boolean {
        return if (numberOfCommits >= MIN_NO_COMMITS_FOR_HIGH_COUPLING) {
            `val`.toDouble() / numberOfCommits.toDouble() > HIGH_COUPLING_VALUE
        } else false
    }

    override fun registerCommit(commit: Commit) {
        numberOfCommits++
        commits.add(commit)
    }

    override fun registerModification(modification: Modification) {
        fileName = modification.filename
    }

    companion object {
        private const val HIGH_COUPLING_VALUE = .35
        private const val MIN_NO_COMMITS_FOR_HIGH_COUPLING = 5L
    }
}
