package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification

class AddQuotDel : Metric {
    private var accumulatedNumberOfLinesAdded: Long = 0
    private var accumulatedNumberOfLinesDeleted: Long = 0

    override fun description(): String {
        return "Relative Code Churn: Quotient of addition churn and deletion churn."
    }

    override fun metricName(): String {
        return "add_quot_deletion"
    }

    override fun value(): Number {
        return when {
            accumulatedNumberOfLinesDeleted > 0 ->
                100 * accumulatedNumberOfLinesAdded / accumulatedNumberOfLinesDeleted
            else ->
                100 * accumulatedNumberOfLinesAdded
        }
    }

    override fun registerModification(modification: Modification) {
        accumulatedNumberOfLinesAdded += modification.additions
        accumulatedNumberOfLinesDeleted += modification.deletions
    }
}
