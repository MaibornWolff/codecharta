package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit
import java.util.*

class WeeksWithCommits: Metric {

    private val weeksWithCommits = TreeSet<CalendarWeek>()

    override fun description(): String {
        return "Weeks With Commits: number of weeks with commits for this file."
    }

    override fun metricName(): String {
        return "weeks_with_commits"
    }

    override fun registerCommit(commit: Commit) {
        weeksWithCommits.add(CalendarWeek.forDateTime(commit.commitDate))
    }

    override fun value(): Number {
        return weeksWithCommits.size
    }
}
