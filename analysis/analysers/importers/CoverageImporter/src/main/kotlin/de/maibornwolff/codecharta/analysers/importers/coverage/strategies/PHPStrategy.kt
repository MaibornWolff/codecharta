package de.maibornwolff.codecharta.analysers.importers.coverage.strategies

import de.maibornwolff.codecharta.analysers.importers.coverage.CoverageAttributes
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.progresstracker.ParsingUnit
import de.maibornwolff.codecharta.progresstracker.ProgressTracker
import org.w3c.dom.Element
import java.io.File
import java.io.PrintStream

class PHPStrategy : ImporterStrategy {
    override val progressTracker: ProgressTracker = ProgressTracker()
    override var totalTrackingItems: Long = 0
    override val parsingUnit: ParsingUnit = ParsingUnit.Files

    override fun addNodesToProjectBuilder(coverageFile: File, projectBuilder: ProjectBuilder, error: PrintStream, keepFullPaths: Boolean) {
        processXMLReport(coverageFile, projectBuilder, error, "file") { element, builder -> processFileElement(element, builder) }
        if (!keepFullPaths) removeExtraNodesAroundProject(projectBuilder)
    }

    private fun processFileElement(fileElement: Element, projectBuilder: ProjectBuilder) {
        val fileNode = createFileNode(fileElement)
        val pathRelativeToProjectRoot = PathFactory.extractOSIndependentPath(fileElement.getAttribute("href")).parent
        projectBuilder.insertByPath(pathRelativeToProjectRoot, fileNode)
    }

    private fun createFileNode(fileElement: Element): MutableNode {
        val fileName = fileElement.getAttribute("name")
        val linesForFile = fileElement.getElementsByTagName("lines")
        if (linesForFile.length == 0) {
            throw IllegalStateException(
                "No line-coverage information was found for the $fileName file! Please ensure the xml file is correctly formatted."
            )
        }
        if (linesForFile.length > 1) {
            throw IllegalStateException(
                "More than one line-coverage was found for a file! Please ensure the xml file is in the default output format of phpunit."
            )
        }
        val lineReportForFile = linesForFile.item(0) as Element
        val lineCoverage = lineReportForFile.getAttribute("percent").toDouble()

        val attributeMap = mutableMapOf(
            CoverageAttributes.LINE_COVERAGE.attributeName to lineCoverage
        )

        return MutableNode(
            name = fileName,
            type = NodeType.File,
            attributes = attributeMap
        )
    }
}
