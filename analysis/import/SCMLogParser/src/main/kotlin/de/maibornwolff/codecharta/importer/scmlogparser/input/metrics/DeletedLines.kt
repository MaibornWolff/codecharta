package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification

class DeletedLines : Metric {
    private var loc: Long = 0

    override fun description(): String {
        return "Lines Of Code: Added lines for this file."
    }

    override fun metricName(): String {
        return "deleted_lines"
    }

    override fun registerModification(modification: Modification) {
        loc += modification.additions
        loc -= modification.deletions
    }

    override fun value(): Number {
        return if (loc >= 0) 0L else -loc
    }
}
