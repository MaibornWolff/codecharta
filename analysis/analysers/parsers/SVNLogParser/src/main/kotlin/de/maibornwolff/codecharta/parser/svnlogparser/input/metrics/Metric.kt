package de.maibornwolff.codecharta.parser.svnlogparser.input.metrics

import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.parser.svnlogparser.input.Commit
import de.maibornwolff.codecharta.parser.svnlogparser.input.Modification

interface Metric {
    fun description(): String

    fun metricName(): String

    fun value(): Number

    fun edgeMetricName(): String? {
        return null
    }

    fun getEdges(): List<Edge> {
        return listOf()
    }

    fun attributeType(): AttributeType {
        return AttributeType.ABSOLUTE
    }

    fun edgeAttributeType(): AttributeType? {
        return null
    }

    fun registerModification(modification: Modification) { // defaults to: do nothing
    }

    fun registerCommit(commit: Commit) { // defaults to: do nothing
    }
}
