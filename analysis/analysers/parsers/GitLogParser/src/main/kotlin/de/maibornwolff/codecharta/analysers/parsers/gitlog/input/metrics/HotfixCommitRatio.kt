package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit
import de.maibornwolff.codecharta.model.AttributeType
import kotlin.math.round

class HotfixCommitRatio : Metric {
    private var totalCommitsCount: Long = 0
    private var hotfixCommitsCount: Long = 0

    override fun description(): String =
        "Hotfix Commit Ratio: Ratio of hotfix commits (containing 'hotfix') to total commits for this file."

    override fun metricName(): String = "hotfix_commit_ratio"

    override fun attributeType(): AttributeType = AttributeType.RELATIVE

    override fun registerCommit(commit: Commit) {
        totalCommitsCount++

        if (commit.message.contains("hotfix", ignoreCase = true)) {
            hotfixCommitsCount++
        }
    }

    override fun value(): Number = if (totalCommitsCount == 0L) {
        0.0
    } else {
        val ratio = hotfixCommitsCount.toDouble() / totalCommitsCount.toDouble()
        round(ratio * 100) / 100
    }
}
