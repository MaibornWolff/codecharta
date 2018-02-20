package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification

interface Metric {

    fun description(): String

    fun metricName(): String

    fun value(): Number

    fun registerModification(modification: Modification) {
        // defaults to: do nothing
    }

    fun registerCommit(commit: Commit) {
        // defaults to: do nothing
    }
}
