package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Commit
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime

class NumberOfAuthorsTest {
    @Test
    fun should_have_initial_value_zero() {
// when
        val metric = NumberOfAuthors()

        // then
        assertThat(metric.value()).isEqualTo(0)
    }

    @Test
    fun should_increase_by_first_author() { // given
        val metric = NumberOfAuthors()

        // when
        metric.registerCommit(Commit("An author", emptyList(), OffsetDateTime.now()))

        // then
        assertThat(metric.value()).isEqualTo(1)
    }

    @Test
    fun should_increase_only_once_for_an_author() { // given
        val metric = NumberOfAuthors()

        // when
        val author = "An author"
        metric.registerCommit(Commit(author, emptyList(), OffsetDateTime.now()))
        metric.registerCommit(Commit(author, emptyList(), OffsetDateTime.now()))

        // then
        assertThat(metric.value()).isEqualTo(1)
    }

    @Test
    fun should_increase_for_different_author() { // given
        val metric = NumberOfAuthors()

        // when
        metric.registerCommit(Commit("An author", emptyList(), OffsetDateTime.now()))
        metric.registerCommit(Commit("Another author", emptyList(), OffsetDateTime.now()))

        // then
        assertThat(metric.value()).isEqualTo(2)
    }

    @Test
    fun should_count_coauthors() {
        // given
        val metric = NumberOfAuthors()

        // when
        metric.registerCommit(
            Commit(
                "Main author",
                emptyList(),
                OffsetDateTime.now(),
                coAuthors = listOf("Coauthor 1", "Coauthor 2")
            )
        )

        // then
        assertThat(metric.value()).isEqualTo(3)
    }

    @Test
    fun should_count_coauthors_only_once() {
        // given
        val metric = NumberOfAuthors()

        // when
        metric.registerCommit(
            Commit(
                "Main author",
                emptyList(),
                OffsetDateTime.now(),
                coAuthors = listOf("Coauthor 1")
            )
        )
        metric.registerCommit(
            Commit(
                "Main author",
                emptyList(),
                OffsetDateTime.now(),
                coAuthors = listOf("Coauthor 1")
            )
        )

        // then
        assertThat(metric.value()).isEqualTo(2)
    }

    @Test
    fun should_count_coauthor_as_main_author_only_once() {
        // given
        val metric = NumberOfAuthors()

        // when
        metric.registerCommit(
            Commit(
                "Main author",
                emptyList(),
                OffsetDateTime.now(),
                coAuthors = listOf("Coauthor 1")
            )
        )
        metric.registerCommit(Commit("Coauthor 1", emptyList(), OffsetDateTime.now()))

        // then
        assertThat(metric.value()).isEqualTo(2)
    }
}
