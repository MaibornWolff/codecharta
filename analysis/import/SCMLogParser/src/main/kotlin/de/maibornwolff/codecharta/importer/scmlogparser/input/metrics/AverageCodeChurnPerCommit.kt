package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification
import de.maibornwolff.codecharta.model.AttributeType

class AverageCodeChurnPerCommit : Metric {
    private var absoluteCodeChurn: Long = 0
    private var numberOfNontrivialCommits: Long = 0
    override fun description(): String {
        return "Average Code Churn: Average code churn per commit of this file."
    }

    override fun metricName(): String {
        return "avg_code_churn"
    }

    override fun registerModification(modification: Modification) {
        val commitsCodeChurn = modification.additions + modification.deletions
        if (commitsCodeChurn > 0) {
            numberOfNontrivialCommits++
            this.absoluteCodeChurn += commitsCodeChurn
        }
    }

    private fun absoluteCodeChurn(): Long {
        return absoluteCodeChurn
    }

    override fun value(): Number {
        return if (numberOfNontrivialCommits > 0) absoluteCodeChurn() / numberOfNontrivialCommits else 0L
    }

    override fun attributeType(): AttributeType {
        return AttributeType.relative
    }
}
