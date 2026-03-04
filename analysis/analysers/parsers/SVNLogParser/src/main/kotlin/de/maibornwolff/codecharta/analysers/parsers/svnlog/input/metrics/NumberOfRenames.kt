package de.maibornwolff.codecharta.analysers.parsers.svnlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.Modification

class NumberOfRenames : Metric {
    private var numberOfRenames = 0

    override fun description(): String = "Number of Renames: The number of times a file was renamed"

    override fun metricName(): String = "number_of_renames"

    override fun registerModification(modification: Modification) {
        if (modification.type == Modification.Type.RENAME) {
            numberOfRenames++
        }
    }

    override fun value(): Number = numberOfRenames
}
