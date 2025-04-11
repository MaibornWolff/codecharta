package de.maibornwolff.codecharta.analysers.importers.coverage.strategies

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
        require(denominator >= 0) { "Denominator must be greater than or equal to 0" }
        require(numerator >= 0) { "Numerator must be greater than or equal to 0" }
        require(denominator >= numerator) { "Denominator must be greater than or equal to numerator" }
        return if (denominator > 0) {
            val percentage = (numerator.toDouble() / denominator) * 100
            Math.round(percentage * 100) / 100.0
        } else {
            100.0
        }
    }
}
