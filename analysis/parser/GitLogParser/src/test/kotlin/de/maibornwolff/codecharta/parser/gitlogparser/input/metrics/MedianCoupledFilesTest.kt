package de.maibornwolff.codecharta.parser.gitlogparser.input.metrics

import de.maibornwolff.codecharta.parser.gitlogparser.input.Commit
import de.maibornwolff.codecharta.parser.gitlogparser.input.Modification
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime
import java.util.Arrays
import java.util.stream.Collectors

class MedianCoupledFilesTest {
    companion object {
        private const val FILENAME = "filename"
        private const val COUPLED_FILE1 = "coupledfilename1"
        private const val COUPLED_FILE2 = "coupledfilename2"
    }

    @Test
    fun should_have_initial_value_zero() {
// when
        val metric = MedianCoupledFiles()

        // then
        assertThat(metric.value()).isEqualTo(0.0)
    }

    @Test
    fun should_not_increase_on_commits_of_same_file() { // given
        val metric = MedianCoupledFiles()

        // when
        registerModifications(metric, FILENAME)

        // then
        assertThat(metric.value()).isEqualTo(0.0)
    }

    @Test
    fun should_increase_on_commit_of_several_files() { // given
        val metric = MedianCoupledFiles()

        // when
        registerModifications(metric, FILENAME, COUPLED_FILE1)

        // then
        assertThat(metric.value()).isEqualTo(1.0)
    }

    @Test
    fun should_increase_by_two_modification() { // given
        val metric = MedianCoupledFiles()

        // when
        registerModifications(metric, FILENAME, COUPLED_FILE1)
        registerModifications(metric, FILENAME)

        // then
        assertThat(metric.value()).isEqualTo(0.5)
    }

    @Test
    fun should_increase_by_three_modification() { // given
        val metric = MedianCoupledFiles()

        // when
        registerModifications(metric, FILENAME, COUPLED_FILE1)
        registerModifications(metric, FILENAME, COUPLED_FILE2)
        registerModifications(metric, FILENAME)

        // then
        assertThat(metric.value()).isEqualTo(1.0)
    }

    private fun registerModifications(metric: Metric, vararg filenames: String) {
        val modificationList = Arrays.stream(filenames).map { Modification(it) }.collect(Collectors.toList())

        val commit = Commit("author", modificationList, OffsetDateTime.now())
        metric.registerCommit(commit)

        modificationList.stream().filter { mod -> FILENAME == mod.currentFilename }.findFirst()
            .ifPresent { metric.registerModification(it) }
    }
}
