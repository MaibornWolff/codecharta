package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit
import java.util.TreeSet

class SuccessiveWeeksWithCommits : Metric {
    private val weeksWithCommits = TreeSet<de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.CalendarWeek>()

    override fun description(): String {
        return "Successive Weeks With Commits: maximal number of successive weeks with commits."
    }

    override fun metricName(): String {
        return "successive_weeks_with_commits"
    }

    override fun registerCommit(commit: Commit) {
        weeksWithCommits.add(de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.CalendarWeek.forDateTime(commit.commitDate))
    }

    override fun value(): Number {
        var numberOfSuccessiveWeeks = 0

        var temp = 0
        var lastWeekWithCommit: de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.CalendarWeek? = null
        for (week in weeksWithCommits) {
            if (lastWeekWithCommit == null || de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.CalendarWeek.numberOfWeeksBetween(week, lastWeekWithCommit) == 1) {
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
        return AttributeType.RELATIVE
    }
}
