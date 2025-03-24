package de.maibornwolff.codecharta.importer.coverage.strategies

import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.progresstracker.ParsingUnit
import de.maibornwolff.codecharta.progresstracker.ProgressTracker
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import java.io.File
import java.io.PrintStream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ImporterStrategyTest {
    private val testStrategy = object : ImporterStrategy {
        override val progressTracker: ProgressTracker = ProgressTracker()
        override var totalTrackingItems: Long = 0
        override val parsingUnit: ParsingUnit = ParsingUnit.Lines

        override fun addNodesToProjectBuilder(coverageFile: File, projectBuilder: ProjectBuilder, error: PrintStream) {
            // Implementation not needed for this test
        }
    }

    @Test
    fun `should calculate coverage percentages accurately`() {
        assertEquals(0.0, testStrategy.calculatePercentage(0, 0))
        assertEquals(33.33, testStrategy.calculatePercentage(1, 3))
        assertEquals(50.0, testStrategy.calculatePercentage(1, 2))
        assertEquals(66.67, testStrategy.calculatePercentage(2, 3))
        assertEquals(85.0, testStrategy.calculatePercentage(17, 20))
        assertEquals(100.0, testStrategy.calculatePercentage(3, 3))
    }
}
