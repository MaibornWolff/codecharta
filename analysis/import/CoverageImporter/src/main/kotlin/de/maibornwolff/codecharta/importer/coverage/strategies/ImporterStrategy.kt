package de.maibornwolff.codecharta.importer.coverage.strategies

import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.progresstracker.ParsingUnit
import de.maibornwolff.codecharta.progresstracker.ProgressTracker
import java.io.File
import java.io.PrintStream

interface ImporterStrategy {
    val progressTracker: ProgressTracker
    var totalTrackingItems: Long
    val parsingUnit: ParsingUnit

    fun addNodesToProjectBuilder(coverageFile: File, projectBuilder: ProjectBuilder, error: PrintStream)

    fun updateProgress(parsedLines: Long) {
        progressTracker.updateProgress(totalTrackingItems, parsedLines, parsingUnit.name)
    }

    fun calculatePercentage(numerator: Int, denominator: Int): Double {
        return if (denominator > 0) {
            val percentage = (numerator.toDouble() / denominator) * 100
            Math.round(percentage * 100) / 100.0
        } else {
            0.0
        }
    }
}
