package de.maibornwolff.codecharta.analysers.importers.coverage.strategies

import de.maibornwolff.codecharta.analysers.importers.coverage.CoverageAttributes
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.progresstracker.ParsingUnit
import de.maibornwolff.codecharta.progresstracker.ProgressTracker
import org.w3c.dom.Document
import org.w3c.dom.Element
import java.io.File
import java.io.PrintStream

class CloverXMLStrategy : ImporterStrategy {
    override val progressTracker: ProgressTracker = ProgressTracker()
    override var totalTrackingItems: Long = 0
    override val parsingUnit: ParsingUnit = ParsingUnit.Files

    override fun addNodesToProjectBuilder(coverageFile: File, projectBuilder: ProjectBuilder, error: PrintStream) {
        try {
            val document: Document = parseXML(coverageFile.absolutePath)

            val fileElements = document.getElementsByTagName("file")

            if (fileElements.length == 0) {
                error.println("The coverage report file does not contain any files.")
                return
            }
            totalTrackingItems = fileElements.length.toLong()
            updateProgress(0)

            for (fileIndex in 0 until fileElements.length) {
                val fileElement = fileElements.item(fileIndex) as Element
                processFileElement(fileElement, projectBuilder)
                updateProgress(fileIndex.toLong() + 1)
            }
        } catch (e: Exception) {
            error.println("Error while parsing XML file: ${e.message}")
            return
        }
    }

    private fun processFileElement(fileElement: Element, projectBuilder: ProjectBuilder) {
        val fileNode = createFileNode(fileElement)
        val pathRelativeToProjectRoot = PathFactory.fromFileSystemPath(fileElement.getAttribute("name")).parent
        projectBuilder.insertByPath(pathRelativeToProjectRoot, fileNode)
    }

    private fun createFileNode(fileElement: Element): MutableNode {
        val fileName = extractFileNameFromPath(fileElement.getAttribute("name"))
        val allMetricElements = fileElement.getElementsByTagName("metrics")

        // as NodeList is not iterable, we need to do it manually
        val directChildrenMetricElements = (0 until allMetricElements.length)
            .map { allMetricElements.item(it) as Element }
            .filter { it.parentNode == fileElement }

        if (directChildrenMetricElements.isEmpty()) {
            throw Exception("no metrics found for file '$fileName', malformed clover.xml file!")
        } else if (directChildrenMetricElements.size > 1) {
            throw Exception("Found too many metric elements for file $fileName, malformed clover.xml file!")
        }
        val metricElements = allMetricElements.item(0) as Element

        val methodCoverage =
            calculatePercentage(metricElements.getAttribute("coveredmethods").toInt(), metricElements.getAttribute("methods").toInt())
        val branchCoverage =
            calculatePercentage(
                metricElements.getAttribute("coveredconditionals").toInt(),
                metricElements.getAttribute("conditionals").toInt()
            )

        // if multiple statements are in one line they get ignored so it's actually more like line coverage
        val lineCoverage =
            calculatePercentage(metricElements.getAttribute("coveredstatements").toInt(), metricElements.getAttribute("statements").toInt())

        val attributes = mutableMapOf(
            CoverageAttributes.LINE_COVERAGE.attributeName to lineCoverage,
            CoverageAttributes.BRANCH_COVERAGE.attributeName to branchCoverage,
            CoverageAttributes.METHOD_COVERAGE.attributeName to methodCoverage
        )

        return MutableNode(
            name = fileName,
            type = NodeType.File,
            attributes = attributes
        )
    }
}
