package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Modification

class AddedLines : Metric {
    private var loc: Long = 0

    override fun description(): String = "Lines Of Code: Added lines for this file."

    override fun metricName(): String = "added_lines"

    override fun registerModification(modification: Modification) {
        loc += modification.additions
        loc -= modification.deletions
    }

    override fun value(): Number = if (loc >= 0) loc else 0L
}
