package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification

class AbsoluteCoupledChurn : Metric {
    private var totalChurn: Long = 0
    private var ownChurn: Long = 0
    override fun description(): String {
        return "Absolute Coupled Churn: Total number of lines changed in all other files when this file was commited."
    }

    override fun metricName(): String {
        return "abs_coupled_churn"
    }

    override fun value(): Number {
        return totalChurn - ownChurn
    }

    override fun registerCommit(commit: Commit) {
        val commitsTotalChurn = commit.modifications
            .map { it.additions + it.deletions }
            .sum()

        if (commitsTotalChurn > 0) {
            totalChurn += commitsTotalChurn
        }
    }

    override fun registerModification(modification: Modification) {
        ownChurn += modification.additions + modification.deletions
    }
}
