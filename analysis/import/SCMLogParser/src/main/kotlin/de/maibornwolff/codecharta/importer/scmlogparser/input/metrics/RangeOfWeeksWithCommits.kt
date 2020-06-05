package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit
import de.maibornwolff.codecharta.model.AttributeType
import java.util.*

class RangeOfWeeksWithCommits : Metric {
    private val weeksWithCommits = TreeSet<CalendarWeek>()
    override fun description(): String {
        return "Range Of Weeks With Commits: Range in Weeks between first and last commit of this file."
    }

    override fun metricName(): String {
        return "range_of_weeks_with_commits"
    }

    override fun registerCommit(commit: Commit) {
        weeksWithCommits.add(CalendarWeek.forDateTime(commit.commitDate))
    }

    override fun value(): Number {
        return if (weeksWithCommits.size < 1) {
            0
        } else 1 + CalendarWeek.numberOfWeeksBetween(weeksWithCommits.last(), weeksWithCommits.first())
    }

    override fun attributeType(): AttributeType {
        return AttributeType.relative
    }
}
