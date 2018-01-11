package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;
import org.junit.Test;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;

public class NumberOfAuthorsTest {
    @Test
    public void should_have_initial_value_zero() {
        // when
        NumberOfAuthors metric = new NumberOfAuthors();

        // then
        assertThat(metric.value()).isEqualTo(0);
    }

    @Test
    public void should_increase_by_first_author() {
        // given
        NumberOfAuthors metric = new NumberOfAuthors();

        // when
        metric.registerCommit(new Commit("An author", Collections.emptyList(), LocalDateTime.now()));

        // then
        assertThat(metric.value()).isEqualTo(1);
    }

    @Test
    public void should_increase_only_once_for_an_author() {
        // given
        NumberOfAuthors metric = new NumberOfAuthors();

        // when
        String author = "An author";
        metric.registerCommit(new Commit(author, Collections.emptyList(), LocalDateTime.now()));
        metric.registerCommit(new Commit(author, Collections.emptyList(), LocalDateTime.now()));

        // then
        assertThat(metric.value()).isEqualTo(1);
    }


    @Test
    public void should_increase_for_different_author() {
        // given
        NumberOfAuthors metric = new NumberOfAuthors();

        // when
        metric.registerCommit(new Commit("An author", Collections.emptyList(), LocalDateTime.now()));
        metric.registerCommit(new Commit("Another author", Collections.emptyList(), LocalDateTime.now()));

        // then
        assertThat(metric.value()).isEqualTo(2);
    }
}