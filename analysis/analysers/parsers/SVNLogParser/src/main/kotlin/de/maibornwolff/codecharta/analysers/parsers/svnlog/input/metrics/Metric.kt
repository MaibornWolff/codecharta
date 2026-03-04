package de.maibornwolff.codecharta.analysers.parsers.svnlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.Commit
import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.Modification
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.Edge

interface Metric {
    fun description(): String

    fun metricName(): String

    fun value(): Number

    fun edgeMetricName(): String? = null

    fun getEdges(): List<Edge> = listOf()

    fun attributeType(): AttributeType = AttributeType.ABSOLUTE

    fun edgeAttributeType(): AttributeType? = null

    fun registerModification(modification: Modification) { // defaults to: do nothing
    }

    fun registerCommit(commit: Commit) { // defaults to: do nothing
    }
}
