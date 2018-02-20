package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification

/**
 * this is only an approximation of the correct code churn.
 */
class RelativeCodeChurn : Metric {
    private var accumulatedNumberOfLinesAdded: Long = 0
    private var accumulatedNumberOfLinesDeleted: Long = 0

    override fun description(): String {
        return "Relative Code Churn: Approximation for the quotient of absolute code churn and loc."
    }

    override fun metricName(): String {
        return "rel_code_churn"
    }

    override fun registerModification(modification: Modification) {
        accumulatedNumberOfLinesAdded += modification.additions
        accumulatedNumberOfLinesDeleted += modification.deletions
    }

    private fun loc(): Long {
        val loc = accumulatedNumberOfLinesAdded - accumulatedNumberOfLinesDeleted
        return if (loc >= 0) loc else 0
    }

    private fun absoluteCodeChurn(): Long {
        return accumulatedNumberOfLinesAdded + accumulatedNumberOfLinesDeleted
    }

    /**
     * @return codeChurn weighted by the maximal number of lines
     */
    override fun value(): Number {

        return if (loc() > 0) absoluteCodeChurn() * 100 / loc() else 0L
    }
}
