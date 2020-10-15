package de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics

import java.time.OffsetDateTime
import java.time.temporal.WeekFields

internal data class CalendarWeek(private val week: Int, private val year: Int) : Comparable<CalendarWeek> {

    override fun compareTo(week: CalendarWeek): Int {
        return numberOfWeeksBetween(this, week)
    }

    companion object {

        fun forDateTime(dateTime: OffsetDateTime): CalendarWeek {
            val week = dateTime.get(WeekFields.ISO.weekOfWeekBasedYear())
            var year = dateTime.year
            year = modifyYear(dateTime, week, year)
            return CalendarWeek(week, year)
        }

        fun numberOfWeeksBetween(a: CalendarWeek, b: CalendarWeek): Int {
            return b.week + 52 * b.year - (a.week + 52 * a.year)
        }

        private fun modifyYear(dateTime: OffsetDateTime, week: Int, initialYear: Int): Int {
            var year = initialYear
            if (isFirstOrSecondWeek(week)) {
                if (dayIsOneOfTheLastSevenDaysInYear(dateTime)) {
                    year += 1
                }
            } else if (dayIsOneOfTheFirstSevenDaysOfTheYear(dateTime)) {
                year -= 1
            }

            return year
        }
        private fun dayIsOneOfTheFirstSevenDaysOfTheYear(dateTime: OffsetDateTime): Boolean {
            return dateTime.dayOfYear < 7
        }

        private fun isFirstOrSecondWeek(weekNumber: Int): Boolean {
            return weekNumber <= 2
        }

        private fun dayIsOneOfTheLastSevenDaysInYear(dateTime: OffsetDateTime): Boolean {
            return dateTime.dayOfYear > 358
        }
    }
}
