package de.maibornwolff.codecharta.analysers.parsers.svnlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.Commit
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime

class NumberOfAuthorsTest {
    @Test
    fun `should have initial value zero`() {
// when
        val metric = NumberOfAuthors()

        // then
        assertThat(metric.value()).isEqualTo(0)
    }

    @Test
    fun `should increase by first author`() { // given
        val metric = NumberOfAuthors()

        // when
        metric.registerCommit(Commit("An author", emptyList(), OffsetDateTime.now()))

        // then
        assertThat(metric.value()).isEqualTo(1)
    }

    @Test
    fun `should increase only once for an author`() { // given
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
}
