package de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics

import java.time.OffsetDateTime
import java.time.temporal.WeekFields

internal data class CalendarWeek(private val week: Int, private val year: Int) : Comparable<CalendarWeek> {

    override fun compareTo(o: CalendarWeek): Int {
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
            return if (dayIsOneOfTheLastSevenDaysInYear(dateTime) && isFirstOrSecondWeek(cwWeek)) {
                cwYear + 1
            } else if (dayIsOneOfTheFirstSevenDaysOfTheYear(dateTime) && !isFirstOrSecondWeek(cwWeek)) {
                cwYear - 1
            } else {
                cwYear
            }
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
