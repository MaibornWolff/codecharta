package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.time.temporal.ChronoUnit
import java.time.temporal.WeekFields

internal data class CalendarWeek(private val week: Int, private val year: Int) : Comparable<de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.CalendarWeek> {
    override fun compareTo(other: de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.CalendarWeek): Int {
        return de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.CalendarWeek.Companion.numberOfWeeksBetween(
            this,
            other
        )
    }

    companion object {
        fun forDateTime(dateTime: OffsetDateTime): de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.CalendarWeek {
            val week = dateTime.get(WeekFields.ISO.weekOfWeekBasedYear())
            var year = dateTime.year
            year = de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.CalendarWeek.Companion.modifyYear(
                dateTime,
                week,
                year
            )
            return de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.CalendarWeek(week, year)
        }

        fun numberOfWeeksBetween(a: de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.CalendarWeek, b: de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.CalendarWeek): Int {
            return ChronoUnit.WEEKS.between(
                de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.CalendarWeek.Companion.getWeekDate(
                    a.year,
                    a.week
                ),
                de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.CalendarWeek.Companion.getWeekDate(
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
            if (de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.CalendarWeek.Companion.isFirstOrSecondWeek(
                    week
                )
            ) {
                if (de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.CalendarWeek.Companion.dayIsOneOfTheLastSevenDaysInYear(
                        dateTime
                    )
                ) {
                    year += 1
                }
            } else if (de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.CalendarWeek.Companion.dayIsOneOfTheFirstSevenDaysOfTheYear(
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
