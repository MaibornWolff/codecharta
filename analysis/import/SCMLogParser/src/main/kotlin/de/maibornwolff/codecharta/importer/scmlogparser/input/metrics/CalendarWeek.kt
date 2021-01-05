package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics

import java.time.OffsetDateTime
import java.time.temporal.ChronoUnit
import java.time.temporal.WeekFields

internal data class CalendarWeek(private val week: Int, private val year: Int) : Comparable<CalendarWeek> {

    override fun compareTo(other: CalendarWeek): Int {
        return numberOfWeeksBetween(this, other)
    }

    companion object {

        fun forDateTime(dateTime: OffsetDateTime): CalendarWeek {
            val cwWeek = dateTime.get(WeekFields.ISO.weekOfWeekBasedYear())
            var cwYear = dateTime.year
            cwYear = modifyYear(dateTime, cwWeek, cwYear)
            return CalendarWeek(cwWeek, cwYear)
        }

        fun numberOfWeeksBetween(a: CalendarWeek, b: CalendarWeek): Int {
            return ChronoUnit.WEEKS.between(getWeekDate(a.year,a.week),getWeekDate(b.year,b.week) ).toInt()
        }

        private fun getWeekDate(year: Int, week: Int): OffsetDateTime? {
            return OffsetDateTime.now().withYear(year)
                                    .with(WeekFields.ISO.weekOfYear(), week.toLong())
                                    .with(WeekFields.ISO.dayOfWeek(), 1)
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
