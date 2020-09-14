package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics

import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.time.OffsetDateTime
import java.time.ZoneOffset

class CalendarWeekTest {

    private val zoneOffset = ZoneOffset.UTC

    @Test
    fun canCreateCalendarWeekFromADateTime() {
        // given
        val commitDateTime = OffsetDateTime.of(2016, 4, 2, 12, 0, 0, 0, zoneOffset)

        // when
        val kw = CalendarWeek.forDateTime(commitDateTime)

        // then
        assertThat(kw).isEqualTo(CalendarWeek(13, 2016))
    }

    @Test
    fun kalenderwoche_wird_mit_tagimjahr_richtig_berechnet_wenn_tag_am_anfang_des_jahres_und_kw_im_vorjahr() {
        // given
        val commitDateTime = OffsetDateTime.of(2016, 1, 3, 12, 0, 0, 0, zoneOffset)

        // when
        val kw = CalendarWeek.forDateTime(commitDateTime)

        // then
        assertThat(kw).isEqualTo(CalendarWeek(53, 2015))
    }

    @Test
    fun kalenderwoche_wird_mit_tagimjahr_richtig_berechnet_wenn_tag_am_ende_des_jahres_und_kw_im_folgejahr() {
        // given
        val commitDateTime = OffsetDateTime.of(2018, 12, 31, 12, 0, 0, 0, zoneOffset)

        // when
        val kw = CalendarWeek.forDateTime(commitDateTime)

        // then
        assertThat(kw).isEqualTo(CalendarWeek(1, 2019))
    }

    @Test
    fun weeksBetweenCommitsRichtigBerechnet() {
        // given
        val commitDateTime2 = OffsetDateTime.of(2018, 1, 11, 12, 0, 0, 0, zoneOffset)
        val commitDateTime3 = OffsetDateTime.of(2017, 12, 13, 12, 0, 0, 0, zoneOffset)

        val kw1 = CalendarWeek.forDateTime(commitDateTime2)
        val kw2 = CalendarWeek.forDateTime(commitDateTime3)

        // then
        assertThat(CalendarWeek.numberOfWeeksBetween(kw2, kw1)).isEqualTo(4)
        assertThat(CalendarWeek.numberOfWeeksBetween(kw1, kw2)).isEqualTo(-4)
        assertThat(CalendarWeek.numberOfWeeksBetween(kw1, kw1)).isEqualTo(0)
        assertThat(CalendarWeek.numberOfWeeksBetween(kw2, kw2)).isEqualTo(0)
    }
}