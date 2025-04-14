package de.maibornwolff.codecharta.analysers.parsers.svnlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.Commit
import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.Modification
import de.maibornwolff.codecharta.model.Edge
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime
import java.util.Arrays
import java.util.stream.Collectors

class HighlyCoupledFilesTest {
    companion object {
        private const val FILENAME = "filename"
        private const val COUPLED_FILE1 = "coupledfilename1"
        private const val COUPLED_FILE2 = "coupledfilename2"
    }

    @Test
    fun `should have initial value zero`() {
// when
        val metric = HighlyCoupledFiles()

        // then
        assertThat(metric.value()).isEqualTo(0L)
        assertThat(metric.getEdges()).isEmpty()
    }

    @Test
    fun `should not increase on commits of same file`() { // given
        val metric = HighlyCoupledFiles()

        // when
        registerModifications(metric, FILENAME)

        // then
        assertThat(metric.value()).isEqualTo(0L)
        assertThat(metric.getEdges()).isEmpty()
    }

    @Test
    fun `should not increase on one commit of several files`() { // given
        val metric = HighlyCoupledFiles()

        // when
        registerModifications(metric, FILENAME, COUPLED_FILE1)

        // then
        assertThat(metric.value()).isEqualTo(0L)
        assertThat(metric.getEdges()).isEmpty()
    }

    @Test
    fun `should increase on at five commits of same files`() { // given
        val metric = HighlyCoupledFiles()
        val expectedEdge = Edge("filename", "coupledfilename1", mapOf("temporal_coupling" to 1.0))

        // when
        for (i in 0..4) {
            registerModifications(metric, FILENAME, COUPLED_FILE1)
        }

        // then
        assertThat(metric.value()).isEqualTo(1L)
        assertThat(metric.getEdges()).containsOnly(expectedEdge)
    }

    @Test
    fun should_increase() { // given
        val metric = HighlyCoupledFiles()
        val expectedEdge = Edge("filename", "coupledfilename1", mapOf("temporal_coupling" to 0.625))

        // when
        registerModifications(metric, FILENAME, COUPLED_FILE1)
        registerModifications(metric, FILENAME, COUPLED_FILE2)
        registerModifications(metric, FILENAME, COUPLED_FILE1)
        registerModifications(metric, FILENAME, COUPLED_FILE1)
        registerModifications(metric, FILENAME, COUPLED_FILE1)
        registerModifications(metric, FILENAME, COUPLED_FILE1)
        registerModifications(metric, FILENAME)
        registerModifications(metric, FILENAME)

        // then
        assertThat(metric.value()).isEqualTo(1L)
        assertThat(metric.getEdges()).containsOnly(expectedEdge)
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
