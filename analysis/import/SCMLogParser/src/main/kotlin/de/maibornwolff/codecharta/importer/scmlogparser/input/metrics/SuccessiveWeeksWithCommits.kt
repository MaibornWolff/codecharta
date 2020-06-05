package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit
import de.maibornwolff.codecharta.model.AttributeType
import java.util.*

class SuccessiveWeeksWithCommits: Metric {

    private val weeksWithCommits = TreeSet<CalendarWeek>()

    override fun description(): String {
        return "Successive Weeks With Commits: maximal number of successive weeks with commits."
    }

    override fun metricName(): String {
        return "successive_weeks_with_commits"
    }

    override fun registerCommit(commit: Commit) {
        weeksWithCommits.add(CalendarWeek.forDateTime(commit.commitDate))
    }

    override fun value(): Number {
        var numberOfSuccessiveWeeks = 0

        var temp = 0
        var lastKwWithCommit: CalendarWeek? = null
        for (kw in weeksWithCommits) {
            if (lastKwWithCommit == null || CalendarWeek.numberOfWeeksBetween(kw, lastKwWithCommit) == 1) {
                temp++
            } else {
                temp = 1
            }
            lastKwWithCommit = kw
            numberOfSuccessiveWeeks = if (temp > numberOfSuccessiveWeeks) temp else numberOfSuccessiveWeeks
        }

        return numberOfSuccessiveWeeks
    }

    override fun attributeType(): AttributeType {
        return AttributeType.relative
    }
}
