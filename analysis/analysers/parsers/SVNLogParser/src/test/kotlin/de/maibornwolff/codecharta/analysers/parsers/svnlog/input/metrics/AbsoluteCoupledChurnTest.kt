package de.maibornwolff.codecharta.analysers.parsers.svnlog.input.metrics

import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.Commit
import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.Modification
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime

class AbsoluteCoupledChurnTest {
    companion object {
        private const val FILENAME = "filename"
        private const val COUPLED_FILE1 = "coupledfilename1"
        private const val COUPLED_FILE2 = "coupledfilename2"
    }

    @Test
    fun `should have initial value zero`() {
// when
        val metric = AbsoluteCoupledChurn()

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun `should not increase on commits of same file`() { // given
        val metric = AbsoluteCoupledChurn()

        // when
        registerModifications(metric, Modification(FILENAME, 7, 2))

        // then
        assertThat(metric.value()).isEqualTo(0L)
    }

    @Test
    fun `should increase on commit of several files`() { // given
        val metric = AbsoluteCoupledChurn()

        // when
        val modification = Modification(FILENAME, 7, 2)
        val modificationOfSecondFile = Modification(COUPLED_FILE1, 3, 1)
        registerModifications(metric, modification, modificationOfSecondFile)

        // then
        assertThat(metric.value()).isEqualTo(4L)
    }

    @Test
    fun `should increase by multiple modification`() { // given
        val metric = AbsoluteCoupledChurn()

        // when
        val modification1 = Modification(FILENAME, 7, 2)
        val modificationOfSecondFile1 = Modification(COUPLED_FILE1, 3, 1)
        registerModifications(metric, modification1, modificationOfSecondFile1)

        val modification2 = Modification(FILENAME, 0, 2)
        val modificationOfThirdFile2 = Modification(COUPLED_FILE2, 1, 4)
        registerModifications(metric, modification2, modificationOfThirdFile2)

        val modification3 = Modification(FILENAME, 1, 1)
        registerModifications(metric, modification3)

        // then
        assertThat(metric.value()).isEqualTo(9L)
    }

    private fun registerModifications(metric: Metric, modification: Modification, vararg otherModifications: Modification) {
        val modificationList = ArrayList(listOf(*otherModifications))
        modificationList.add(modification)

        val commit = Commit("author", modificationList, OffsetDateTime.now())
        metric.registerCommit(commit)
        metric.registerModification(modification)
    }
}
