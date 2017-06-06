package de.maibornwolff.codecharta.model.input;

import org.junit.Test;

import java.time.LocalDateTime;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

public class VersionControlledFileTest {

    @Test
    public void versionControlledFileHoldsInitallyOnlyTheFilename() throws Exception {
        // given
        String filename = "filename";

        // when
        VersionControlledFile versionControlledFile = new VersionControlledFile(filename);

        // then
        assertThat(versionControlledFile.getFilename()).isEqualTo(filename);
        assertThat(versionControlledFile.getAuthors()).isEmpty();
        assertThat(versionControlledFile.getNumberOfAuthors()).isEqualTo(0);
        assertThat(versionControlledFile.getNumberOfOccurrencesInCommits()).isEqualTo(0);
    }

    @Test
    public void canRegisterACommit() throws Exception {
        // given
        String filename = "filename";
        String author = "An Author";
        VersionControlledFile versionControlledFile = new VersionControlledFile(filename);

        // when
        versionControlledFile.registerCommit(new Commit(author, Arrays.asList(filename), LocalDateTime.now()));

        // then
        assertThat(versionControlledFile.getFilename()).isEqualTo(filename);
        assertThat(versionControlledFile.getAuthors()).containsExactly(author);
        assertThat(versionControlledFile.getNumberOfAuthors()).isEqualTo(1);
        assertThat(versionControlledFile.getNumberOfOccurrencesInCommits()).isEqualTo(1);
    }

    @Test
    public void canRegisterMultipleCommitsWithSimpleStatistics() throws Exception {
        // given
        String filename = "filename";
        String author1 = "An Author";
        String author2 = "2nd Author";
        VersionControlledFile versionControlledFile = new VersionControlledFile(filename);

        // when
        versionControlledFile.registerCommit(new Commit(author1, Arrays.asList(filename), LocalDateTime.now()));
        versionControlledFile.registerCommit(new Commit(author2, Arrays.asList(filename), LocalDateTime.now()));
        versionControlledFile.registerCommit(new Commit(author1, Arrays.asList(filename), LocalDateTime.now()));

        // then
        assertThat(versionControlledFile.getFilename()).isEqualTo(filename);
        assertThat(versionControlledFile.getAuthors()).containsExactlyInAnyOrder(author1, author2);
        assertThat(versionControlledFile.getNumberOfAuthors()).isEqualTo(2);
        assertThat(versionControlledFile.getNumberOfOccurrencesInCommits()).isEqualTo(3);
    }


    @Test
    public void canRegisterMultipleCommitsAndReturnsCommitWeeks() throws Exception {
        // given
        String filename = "filename";
        String author1 = "An Author";
        String author2 = "A 2nd Author";
        LocalDateTime commitDate1 = LocalDateTime.now();
        LocalDateTime commitDate2 = LocalDateTime.now();
        LocalDateTime commitDate3 = commitDate1.minusDays(7);
        VersionControlledFile versionControlledFile = new VersionControlledFile(filename);

        // when
        versionControlledFile.registerCommit(new Commit(author1, Arrays.asList(filename), commitDate1));
        versionControlledFile.registerCommit(new Commit(author2, Arrays.asList(filename), commitDate2));
        versionControlledFile.registerCommit(new Commit(author1, Arrays.asList(filename), commitDate3));

        // then
        assertThat(versionControlledFile.getFilename()).isEqualTo(filename);
        assertThat(versionControlledFile.getAuthors()).containsExactlyInAnyOrder(author1, author2);
        assertThat(versionControlledFile.getNumberOfAuthors()).isEqualTo(2);
        assertThat(versionControlledFile.getNumberOfOccurrencesInCommits()).isEqualTo(3);
        assertThat(versionControlledFile.getNumberOfWeeksWithCommits()).isEqualTo(2);
    }

    @Test
    public void canCreateCalendarWeekFromADateTime(){
        // given
        LocalDateTime commitDateTime = LocalDateTime.of(2016, 4, 2, 12, 00);

        // when
        VersionControlledFile.CalendarWeek kw = VersionControlledFile.CalendarWeek.forDateTime(commitDateTime);

        // then
        assertThat(kw).isEqualTo(new VersionControlledFile.CalendarWeek(13, 2016));
    }

    @Test
    public void kalenderwoche_wird_mit_tagimjahr_richtig_berechnet_wenn_tag_am_anfang_des_jahres_und_kw_im_vorjahr(){
        // given
        LocalDateTime commitDateTime = LocalDateTime.of(2016, 1, 3, 12, 00);

        // when
        VersionControlledFile.CalendarWeek kw = VersionControlledFile.CalendarWeek.forDateTime(commitDateTime);

        // then
        assertThat(kw).isEqualTo(new VersionControlledFile.CalendarWeek(53, 2015));
    }

    @Test
    public void kalenderwoche_wird_mit_tagimjahr_richtig_berechnet_wenn_tag_am_ende_des_jahres_und_kw_im_folgejahr(){
        // given
        LocalDateTime commitDateTime = LocalDateTime.of(2018, 12, 31, 12, 00);

        // when
        VersionControlledFile.CalendarWeek kw = VersionControlledFile.CalendarWeek.forDateTime(commitDateTime);

        // then
        assertThat(kw).isEqualTo(new VersionControlledFile.CalendarWeek(1, 2019));
    }

}