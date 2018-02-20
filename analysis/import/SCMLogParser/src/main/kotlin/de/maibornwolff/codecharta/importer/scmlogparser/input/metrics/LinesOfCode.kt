package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification

/**
 * this is only an approximation of the correct code churn.
 */
class LinesOfCode : Metric {
    private var loc: Long = 0

    override fun description(): String {
        return "Lines Of Code: Approximation for loc. Number of added minus number of deleted lines of all commits for this file."
    }

    override fun metricName(): String {
        return "loc"
    }

    override fun registerModification(modification: Modification) {
        loc += modification.additions
        loc -= modification.deletions
    }

    /**
     * this is only an approximation of the correct file size.
     * correct only if e.g. --numstat -m --first-parent ist given.
     */
    override fun value(): Number {
        return if (loc >= 0) loc else 0
    }
}
