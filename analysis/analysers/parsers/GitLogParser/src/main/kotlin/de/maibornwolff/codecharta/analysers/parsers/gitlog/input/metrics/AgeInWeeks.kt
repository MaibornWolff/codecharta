package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit
import java.time.OffsetDateTime

class AgeInWeeks : Metric {
    private var firstCommit: de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.CalendarWeek = de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.CalendarWeek.forDateTime(OffsetDateTime.now())

    override fun description(): String {
        return "Age in Weeks: Number of Weeks since the creation of the file."
    }

    override fun metricName(): String {
        return "age_in_weeks"
    }

    override fun registerCommit(commit: Commit) {
        firstCommit = de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.CalendarWeek.forDateTime(commit.commitDate)
    }

    override fun value(): Number {
        val thisWeek = de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.CalendarWeek.forDateTime(OffsetDateTime.now())
        return de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.CalendarWeek.numberOfWeeksBetween(firstCommit, thisWeek)
    }

    override fun attributeType(): AttributeType {
        return AttributeType.RELATIVE
    }
}
