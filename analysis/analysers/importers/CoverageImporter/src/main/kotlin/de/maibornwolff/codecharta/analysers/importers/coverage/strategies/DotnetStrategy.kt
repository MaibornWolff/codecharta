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

class DotnetStrategy : ImporterStrategy {
    override val progressTracker: ProgressTracker = ProgressTracker()
    override var totalTrackingItems: Long = 0
    override val parsingUnit: ParsingUnit = ParsingUnit.Packages

    override fun addNodesToProjectBuilder(coverageFile: File, projectBuilder: ProjectBuilder, error: PrintStream, keepFullPaths: Boolean) {
        processXMLReport(coverageFile, projectBuilder, error, "package") { element, builder -> processPackageElement(element, builder) }
        if (!keepFullPaths) removeExtraNodesAroundProject(projectBuilder)
    }

    private fun processPackageElement(packageElement: Element, projectBuilder: ProjectBuilder) {
        val seenFiles = mutableMapOf<String, MutableNode>()
        val classElements = packageElement.getElementsByTagName("class")
        for (classIndex in 0 until classElements.length) {
            val classElement = classElements.item(classIndex) as Element
            val filePath = classElement.getAttribute("filename")
            if (filePath in seenFiles.keys) {
                val existingNode = seenFiles[filePath]
                updateFileNode(existingNode!!, classElement)
            } else {
                seenFiles[filePath] = createFileNode(extractFileNameFromPath(filePath), classElement)
            }
        }

        for (seenFile in seenFiles) {
            val filePath = seenFile.key
            val fileNode = seenFile.value

            val path = PathFactory.extractOSIndependentPath(filePath).parent
            projectBuilder.insertByPath(path, fileNode)
        }
    }

    private fun createFileNode(fileName: String, classElement: Element): MutableNode {
        val lineCoverage = classElement.getAttribute("line-rate").toDouble() * 100
        val branchCoverage = classElement.getAttribute("branch-rate").toDouble() * 100

        val attributes = mutableMapOf(
            CoverageAttributes.LINE_COVERAGE.attributeName to lineCoverage,
            CoverageAttributes.BRANCH_COVERAGE.attributeName to branchCoverage
        )

        return MutableNode(
            name = fileName,
            type = NodeType.File,
            attributes = attributes
        )
    }

    private fun updateFileNode(fileNode: MutableNode, classElement: Element) {
        val newElementLineCoverage = classElement.getAttribute("line-rate").toDouble() * 100
        val newElementBranchCoverage = classElement.getAttribute("branch-rate").toDouble() * 100

        val existingLineCoverage = fileNode.attributes[CoverageAttributes.LINE_COVERAGE.attributeName] as Double
        val existingBranchCoverage = fileNode.attributes[CoverageAttributes.BRANCH_COVERAGE.attributeName] as Double

        val updatedAttributes = fileNode.attributes.toMutableMap()
        updatedAttributes[CoverageAttributes.LINE_COVERAGE.attributeName] = existingLineCoverage + newElementLineCoverage
        updatedAttributes[CoverageAttributes.BRANCH_COVERAGE.attributeName] = existingBranchCoverage + newElementBranchCoverage

        fileNode.attributes = updatedAttributes
    }
}
