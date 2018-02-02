package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics

import java.time.OffsetDateTime
import java.time.temporal.WeekFields

internal class CalendarWeek(private val week: Int, private val year: Int) : Comparable<CalendarWeek> {

    override fun equals(o: Any?): Boolean {
        if (this === o) return true
        if (o == null || javaClass != o.javaClass) return false

        val that = o as CalendarWeek?

        return week == that!!.week && year == that.year
    }

    override fun hashCode(): Int {
        var result = week
        result = 31 * result + year
        return result
    }

    override fun compareTo(o: CalendarWeek): Int {
        if (o == null) {
            throw NullPointerException()
        }
        return numberOfWeeksBetween(this, o)
    }

    companion object {

        fun forDateTime(dateTime: OffsetDateTime): CalendarWeek {
            val cwWeek = dateTime.get(WeekFields.ISO.weekOfWeekBasedYear())
            var cwYear = dateTime.year
            cwYear = modifyYear(dateTime, cwWeek, cwYear)
            return CalendarWeek(cwWeek, cwYear)
        }

        fun numberOfWeeksBetween(a: CalendarWeek, b: CalendarWeek): Int {
            return b.week + 52 * b.year - (a.week + 52 * a.year)
        }

        private fun modifyYear(dateTime: OffsetDateTime, cwWeek: Int, cwYear: Int): Int {
            var cwYear = cwYear
            if (dayIsOneOfTheLastSevenDaysInYear(dateTime) && isFirstOrSecondWeek(cwWeek))
                cwYear++
            else if (dayIsOneOfTheFirstSevenDaysOfTheYear(dateTime) && !isFirstOrSecondWeek(cwWeek))
                cwYear--
            return cwYear
        }

        private fun dayIsOneOfTheFirstSevenDaysOfTheYear(dateTime: OffsetDateTime): Boolean {
            return dateTime.dayOfYear < 7
        }

        private fun isFirstOrSecondWeek(kalenderWeeknWeek: Int): Boolean {
            return kalenderWeeknWeek <= 2
        }

        private fun dayIsOneOfTheLastSevenDaysInYear(dateTime: OffsetDateTime): Boolean {
            return dateTime.dayOfYear > 358
        }
    }
}
