package de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Commit
import de.maibornwolff.codecharta.model.AttributeType
import java.util.TreeSet

class SuccessiveWeeksWithCommits : Metric {

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
        var lastWeekWithCommit: CalendarWeek? = null
        for (week in weeksWithCommits) {
            if (lastWeekWithCommit == null || CalendarWeek.numberOfWeeksBetween(week, lastWeekWithCommit) == 1) {
                temp += 1
            } else {
                temp = 1
            }
            lastWeekWithCommit = week
            numberOfSuccessiveWeeks = if (temp > numberOfSuccessiveWeeks) temp else numberOfSuccessiveWeeks
        }

        return numberOfSuccessiveWeeks
    }

    override fun attributeType(): AttributeType {
        return AttributeType.relative
    }
}
