package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Modification

class NumberOfOccurencesInCommits : Metric {
    private var numberOfOccurrencesInCommits: Long = 0

    override fun description(): String {
        return "Number Of Commits: Number of times this file occured in a commit."
    }

    override fun metricName(): String {
        return "number_of_commits"
    }

    override fun registerModification(modification: Modification) {
        numberOfOccurrencesInCommits++
    }

    override fun value(): Number {
        return numberOfOccurrencesInCommits
    }
}
