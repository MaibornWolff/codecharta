package de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Modification
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.Edge

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
        return AttributeType.absolute
    }

    fun edgeAttributeType(): AttributeType? {
        return null
    }

    fun registerModification(modification: Modification) {
        // defaults to: do nothing
    }

    fun registerCommit(commit: Commit) {
        // defaults to: do nothing
    }
}
