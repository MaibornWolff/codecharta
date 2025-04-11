package de.maibornwolff.codecharta.analysers.parsers.svnlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.Commit
import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.Modification
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
    fun `should have initial value zero`() {
// when
        val metric = MedianCoupledFiles()

        // then
        assertThat(metric.value()).isEqualTo(0.0)
    }

    @Test
    fun `should not increase on commits of same file`() { // given
        val metric = MedianCoupledFiles()

        // when
        registerModifications(metric, FILENAME)

        // then
        assertThat(metric.value()).isEqualTo(0.0)
    }

    @Test
    fun `should increase on commit of several files`() { // given
        val metric = MedianCoupledFiles()

        // when
        registerModifications(metric, FILENAME, COUPLED_FILE1)

        // then
        assertThat(metric.value()).isEqualTo(1.0)
    }

    @Test
    fun `should increase by two modification`() { // given
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
        val modificationList =
            Arrays.stream(filenames).map<Modification> { Modification(it) }.collect(Collectors.toList())

        val commit = Commit("author", modificationList, OffsetDateTime.now())
        metric.registerCommit(commit)

        modificationList.stream().filter { mod -> FILENAME == mod.filename }.findFirst()
            .ifPresent { metric.registerModification(it) }
    }
}
