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

class JacocoStrategy : ImporterStrategy {
    override val progressTracker: ProgressTracker = ProgressTracker()
    override var totalTrackingItems: Long = 0
    override val parsingUnit: ParsingUnit = ParsingUnit.Packages

    override fun addNodesToProjectBuilder(coverageFile: File, projectBuilder: ProjectBuilder, error: PrintStream, keepFullPaths: Boolean) {
        processXMLReport(coverageFile, projectBuilder, error, "package") { element, builder -> processPackageElement(element, builder) }
        if (!keepFullPaths) removeExtraNodesAroundProject(projectBuilder)
    }

    private fun processPackageElement(packageElement: Element, projectBuilder: ProjectBuilder) {
        val classElements = packageElement.getElementsByTagName("class")
        for (classIndex in 0 until classElements.length) {
            val classElement = classElements.item(classIndex) as Element
            val className = classElement.getAttribute("name")
            val sourceFileName = classElement.getAttribute("sourcefilename")
            val fileNode = createFileNode(sourceFileName, classElement)

            val path = PathFactory.extractOSIndependentPath(className).parent
            projectBuilder.insertByPath(path, fileNode)
        }
    }

    private fun createFileNode(fileName: String, classElement: Element): MutableNode {
        var lineCoverage = -1.0
        var instructionCoverage = -1.0
        var complexityCoverage = -1.0
        var methodCoverage = -1.0
        var classCoverage = -1.0

        val counterElements = classElement.getElementsByTagName("counter")
        for (i in 0 until counterElements.length) {
            val counterElement = counterElements.item(i) as Element
            val type = counterElement.getAttribute("type")
            val covered = counterElement.getAttribute("covered").toInt()
            val missed = counterElement.getAttribute("missed").toInt()
            val total = covered + missed
            val coverage = calculatePercentage(covered, total)

            when (type) {
                "LINE" -> lineCoverage = coverage
                "INSTRUCTION" -> instructionCoverage = coverage
                "COMPLEXITY" -> complexityCoverage = coverage
                "METHOD" -> methodCoverage = coverage
                "CLASS" -> classCoverage = coverage
            }
        }

        val attributes = mutableMapOf(
            CoverageAttributes.LINE_COVERAGE.attributeName to lineCoverage,
            CoverageAttributes.INSTRUCTION_COVERAGE.attributeName to instructionCoverage,
            CoverageAttributes.COMPLEXITY_COVERAGE.attributeName to complexityCoverage,
            CoverageAttributes.METHOD_COVERAGE.attributeName to methodCoverage,
            CoverageAttributes.CLASS_COVERAGE.attributeName to classCoverage
        )

        return MutableNode(
            name = fileName,
            type = NodeType.File,
            attributes = attributes
        )
    }
}
