package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;


import org.junit.Test;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

public class CalendarWeekTest {

    private final ZoneOffset zoneOffset = ZoneOffset.UTC;

    @Test
    public void canCreateCalendarWeekFromADateTime() {
        // given
        OffsetDateTime commitDateTime = OffsetDateTime.of(2016, 4, 2, 12, 0, 0, 0, zoneOffset);

        // when
        CalendarWeek kw = CalendarWeek.forDateTime(commitDateTime);

        // then
        assertThat(kw).isEqualTo(new CalendarWeek(13, 2016));
    }

    @Test
    public void kalenderwoche_wird_mit_tagimjahr_richtig_berechnet_wenn_tag_am_anfang_des_jahres_und_kw_im_vorjahr() {
        // given
        OffsetDateTime commitDateTime = OffsetDateTime.of(2016, 1, 3, 12, 0, 0, 0, zoneOffset);

        // when
        CalendarWeek kw = CalendarWeek.forDateTime(commitDateTime);

        // then
        assertThat(kw).isEqualTo(new CalendarWeek(53, 2015));
    }

    @Test
    public void kalenderwoche_wird_mit_tagimjahr_richtig_berechnet_wenn_tag_am_ende_des_jahres_und_kw_im_folgejahr() {
        // given
        OffsetDateTime commitDateTime = OffsetDateTime.of(2018, 12, 31, 12, 0, 0, 0, zoneOffset);

        // when
        CalendarWeek kw = CalendarWeek.forDateTime(commitDateTime);

        // then
        assertThat(kw).isEqualTo(new CalendarWeek(1, 2019));
    }
}