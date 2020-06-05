package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit
import de.maibornwolff.codecharta.model.AttributeType

class MedianCoupledFiles: Metric {
    private val numberCommitedFiles = mutableListOf<Int>()

    private fun Iterable<Double>.median(): Double {
        val list = this.sorted()

        val len = list.size
        if (len == 0) {
            return 0.0
        } else if (len % 2 == 0) {
            return (list[len / 2 - 1] + list[len / 2]) / 2.0
        }
        return list[len / 2]
    }

    override fun description(): String {
        return "Median Coupled Files: Median of number of other files that where commited with this file."
    }

    override fun metricName(): String {
        return "median_coupled_files"
    }

    override fun value(): Number {
        return numberCommitedFiles.map { v -> v.toDouble() }.median()
    }

    override fun registerCommit(commit: Commit) {
        numberCommitedFiles.add(commit.modifications.size - 1)
    }

    override fun attributeType(): AttributeType {
        return AttributeType.relative
    }
}
