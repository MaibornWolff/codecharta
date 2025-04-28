package de.maibornwolff.codecharta.analysers.importers.coverage.strategies

import de.maibornwolff.codecharta.analysers.importers.coverage.CoverageAttributes
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.progresstracker.ParsingUnit
import de.maibornwolff.codecharta.progresstracker.ProgressTracker
import de.maibornwolff.codecharta.util.Logger
import org.w3c.dom.Document
import org.w3c.dom.Element
import java.io.File
import java.io.PrintStream

class DotnetStrategy : ImporterStrategy {
    override val progressTracker: ProgressTracker = ProgressTracker()
    override var totalTrackingItems: Long = 0
    override val parsingUnit: ParsingUnit = ParsingUnit.Packages

    override fun addNodesToProjectBuilder(coverageFile: File, projectBuilder: ProjectBuilder, error: PrintStream) {
        try {
            val document: Document = parseXML(coverageFile.absolutePath)

            val packageElements = document.getElementsByTagName("package")

            if (packageElements.length == 0) {
                error.println("The coverage report file does not contain any package elements.")
                return
            }
            totalTrackingItems = packageElements.length.toLong()
            updateProgress(0)

            for (packageIndex in 0 until packageElements.length) {
                val packageElement = packageElements.item(packageIndex) as Element
                processPackageElement(packageElement, projectBuilder)
                updateProgress(packageIndex.toLong() + 1)
            }
        } catch (e: Exception) {
            error.println("Error while parsing XML file: ${e.message}")
            return
        }
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
                val fileName = extractFileNameFromPath(filePath)
                seenFiles[filePath] = createFileNode(fileName, classElement)
            }
        }

        for (seenFile in seenFiles) {
            val filePath = seenFile.key
            val fileNode = seenFile.value

            val path = PathFactory.fromFileSystemPath(filePath).parent
            projectBuilder.insertByPath(path, fileNode)
        }
    }

    private fun extractFileNameFromPath(path: String): String {
        val lastUnixPathSeparator = path.lastIndexOf('/')
        val lastWindowsPathSeparator = path.lastIndexOf('\\')

        val lastPathSeparatorIndex = maxOf(lastUnixPathSeparator, lastWindowsPathSeparator)

        if (lastPathSeparatorIndex < 0) return path

        if (path[lastPathSeparatorIndex] != File.separatorChar) {
            Logger.warn { "Non-native file paths detected in coverage report! This might result in an incorrect cc.json file" }
        }

        return path.substring(lastPathSeparatorIndex + 1)
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
