package de.maibornwolff.codecharta.parser.gitlogparser.input.metrics

import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.parser.gitlogparser.input.Commit
import java.time.OffsetDateTime

class AgeInWeeks : Metric {
    private var firstCommit: CalendarWeek = CalendarWeek.forDateTime(OffsetDateTime.now())

    override fun description(): String {
        return "Age in Weeks: Number of Weeks since the creation of the file."
    }

    override fun metricName(): String {
        return "age_in_weeks"
    }

    override fun registerCommit(commit: Commit) {
        firstCommit = CalendarWeek.forDateTime(commit.commitDate)
    }

    override fun value(): Number {
        val thisWeek = CalendarWeek.forDateTime(OffsetDateTime.now())
        return CalendarWeek.numberOfWeeksBetween(firstCommit, thisWeek)
    }

    override fun attributeType(): AttributeType {
        return AttributeType.RELATIVE
    }
}
