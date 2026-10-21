package de.maibornwolff.codecharta.analysers.parsers.dependency.regression

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource
import java.io.File

/**
 * Runs every probe below `sample-projects/regression`. After a deliberate change of the output, run the test with the
 * environment variable `UPDATE_REGRESSION_PROBES=true` to rewrite the expectations, then review the diff.
 */
class ProbeRegressionTest {
    companion object {
        private const val PROBES_FOLDER = "sample-projects/regression"
        private const val UPDATE_VARIABLE = "UPDATE_REGRESSION_PROBES"

        @JvmStatic
        fun probes(): List<String> = RegressionProbe.namesBelow(probesRoot())

        private fun probesRoot(): File = generateSequence(File("").absoluteFile) { it.parentFile }
            .map { it.resolve(PROBES_FOLDER) }
            .first { it.isDirectory }
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("probes")
    fun `should draw exactly the edges a regression probe expects`(probeName: String) {
        // Arrange
        val probe = RegressionProbe(probesRoot().resolve(probeName))
        assertThat(probe.layoutProblems()).describedAs("not a probe folder").isEmpty()
        if (System.getenv(UPDATE_VARIABLE) == "true") probe.writeExpectedLines()

        probe.knownGaps.checkAgainst(probe.expectedLines())

        // Act
        val actual = probe.actualLines()

        // Assert
        val drawnToday = probe.linesDrawnToday()
        assertThat(actual)
            .describedAs(
                "missing: %s%nunexpected: %s%nknown gaps closed, delete these lines from known-gaps.txt: %s",
                drawnToday - actual.toSet(),
                actual - drawnToday.toSet(),
                probe.knownGaps.closedBy(actual)
            ).containsExactlyInAnyOrderElementsOf(drawnToday)
    }
}
