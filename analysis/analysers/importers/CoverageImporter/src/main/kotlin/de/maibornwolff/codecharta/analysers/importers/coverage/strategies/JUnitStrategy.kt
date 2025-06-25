package de.maibornwolff.codecharta.analysers.importers.coverage.strategies

import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.progresstracker.ParsingUnit
import de.maibornwolff.codecharta.progresstracker.ProgressTracker
import java.io.File
import java.io.PrintStream
import org.w3c.dom.Element

class JUnitStrategy : ImporterStrategy {
    override val progressTracker: ProgressTracker = ProgressTracker()
    override var totalTrackingItems: Long = 0
    override val parsingUnit: ParsingUnit = ParsingUnit.Files

    override fun addNodesToProjectBuilder(coverageFile: File, projectBuilder: ProjectBuilder, error: PrintStream, keepFullPaths: Boolean) {
        processXMLReport(coverageFile, projectBuilder, error, "testsuite") { element, builder -> processFileElement(element, builder) }
    }

    private fun processFileElement(element: Element, builder: ProjectBuilder) {

    }
}
