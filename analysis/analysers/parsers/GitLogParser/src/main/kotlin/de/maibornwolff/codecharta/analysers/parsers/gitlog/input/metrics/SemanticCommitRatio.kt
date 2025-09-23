package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit
import de.maibornwolff.codecharta.model.AttributeType
import kotlin.math.round

class SemanticCommitRatio : Metric {
    private var totalCommitsCount: Long = 0
    private var semanticCommitsCount: Long = 0

    override fun description(): String {
        return "Semantic Commit Ratio: Ratio of semantic commits (feat, fix, docs, style, refactor, test) to total commits for this file."
    }

    override fun metricName(): String {
        return "semantic_commit_ratio"
    }

    override fun attributeType(): AttributeType {
        return AttributeType.RELATIVE
    }

    override fun registerCommit(commit: Commit) {
        totalCommitsCount++

        if (SemanticCommitDetector.isSemanticCommit(commit.message)) {
            semanticCommitsCount++
        }
    }

    override fun value(): Number {
        return if (totalCommitsCount == 0L) {
            0.0
        } else {
            val ratio = semanticCommitsCount.toDouble() / totalCommitsCount.toDouble()
            round(ratio * 100) / 100
        }
    }
}
