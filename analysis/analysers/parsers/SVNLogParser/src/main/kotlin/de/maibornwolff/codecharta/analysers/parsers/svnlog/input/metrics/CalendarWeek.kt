package de.maibornwolff.codecharta.analysers.parsers.svnlog.input.metrics

import java.time.OffsetDateTime
import java.time.ZoneOffset
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
            return ChronoUnit.WEEKS.between(getWeekDate(a.year, a.week), getWeekDate(b.year, b.week)).toInt()
        }

        private fun getWeekDate(year: Int, week: Int): OffsetDateTime? { // returns the date of Monday based on the week and year
            return OffsetDateTime.now().withYear(year).with(WeekFields.ISO.weekOfWeekBasedYear(), week.toLong())
                .with(WeekFields.ISO.dayOfWeek(), 1).withHour(12).withMinute(0).withSecond(0).withNano(0)
                .withOffsetSameInstant(ZoneOffset.UTC)
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

        private fun isFirstOrSecondWeek(calendarWeek: Int): Boolean {
            return calendarWeek <= 2
        }

        private fun dayIsOneOfTheLastSevenDaysInYear(dateTime: OffsetDateTime): Boolean {
            return dateTime.dayOfYear > 358
        }
    }
}
