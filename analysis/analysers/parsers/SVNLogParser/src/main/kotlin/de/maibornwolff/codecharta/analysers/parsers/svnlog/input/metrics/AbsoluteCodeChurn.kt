package de.maibornwolff.codecharta.analysers.parsers.svnlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.Modification

class AbsoluteCodeChurn : Metric {
    private var accumulatedNumberOfLinesAdded: Long = 0
    private var accumulatedNumberOfLinesDeleted: Long = 0

    override fun description(): String {
        return "Absolute Code Churn: Sum of number of added and deleted lines of all commits for this file."
    }

    override fun metricName(): String {
        return "abs_code_churn"
    }

    override fun registerModification(modification: Modification) {
        accumulatedNumberOfLinesAdded += modification.additions
        accumulatedNumberOfLinesDeleted += modification.deletions
    }

    override fun value(): Number {
        return accumulatedNumberOfLinesAdded + accumulatedNumberOfLinesDeleted
    }
}
