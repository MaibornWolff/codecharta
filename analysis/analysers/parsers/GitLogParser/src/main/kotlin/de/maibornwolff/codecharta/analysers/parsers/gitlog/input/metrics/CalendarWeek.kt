package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.time.temporal.ChronoUnit
import java.time.temporal.WeekFields

internal data class CalendarWeek(private val week: Int, private val year: Int) : Comparable<CalendarWeek> {
    override fun compareTo(other: CalendarWeek): Int {
        return numberOfWeeksBetween(
            this,
            other
        )
    }

    companion object {
        fun forDateTime(dateTime: OffsetDateTime): CalendarWeek {
            val week = dateTime.get(WeekFields.ISO.weekOfWeekBasedYear())
            var year = dateTime.year
            year = modifyYear(
                dateTime,
                week,
                year
            )
            return CalendarWeek(week, year)
        }

        fun numberOfWeeksBetween(a: CalendarWeek, b: CalendarWeek): Int {
            return ChronoUnit.WEEKS.between(
                getWeekDate(
                    a.year,
                    a.week
                ),
                getWeekDate(
                    b.year,
                    b.week
                )
            ).toInt()
        }

        private fun getWeekDate(year: Int, week: Int): OffsetDateTime? { // returns the date of Monday based on the week and year
            return OffsetDateTime.now().withYear(year).with(WeekFields.ISO.weekOfWeekBasedYear(), week.toLong())
                .with(WeekFields.ISO.dayOfWeek(), 1).withHour(12).withMinute(0).withSecond(0).withNano(0)
                .withOffsetSameInstant(ZoneOffset.UTC)
        }

        private fun modifyYear(dateTime: OffsetDateTime, week: Int, initialYear: Int): Int {
            var year = initialYear
            if (isFirstOrSecondWeek(
                    week
                )
            ) {
                if (dayIsOneOfTheLastSevenDaysInYear(
                        dateTime
                    )
                ) {
                    year += 1
                }
            } else if (dayIsOneOfTheFirstSevenDaysOfTheYear(
                    dateTime
                )
            ) {
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
