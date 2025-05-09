package de.maibornwolff.codecharta.analysers.importers.coverage.strategies

import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.progresstracker.ParsingUnit
import de.maibornwolff.codecharta.progresstracker.ProgressTracker
import de.maibornwolff.codecharta.util.Logger
import org.w3c.dom.Document
import org.w3c.dom.Element
import org.xml.sax.InputSource
import java.io.File
import java.io.FileInputStream
import java.io.PrintStream
import javax.xml.parsers.DocumentBuilder
import javax.xml.parsers.DocumentBuilderFactory

interface ImporterStrategy {
    val progressTracker: ProgressTracker
    var totalTrackingItems: Long
    val parsingUnit: ParsingUnit

    fun addNodesToProjectBuilder(coverageFile: File, projectBuilder: ProjectBuilder, error: PrintStream, keepFullPaths: Boolean = false)

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

    fun processXMLReport(
        reportFile: File,
        projectBuilder: ProjectBuilder,
        error: PrintStream,
        elementTag: String,
        elementProcessor: (Element, ProjectBuilder) -> Unit
    ) {
        try {
            val document: Document = parseXML(reportFile.absolutePath)

            val fileElements = document.getElementsByTagName(elementTag)

            if (fileElements.length == 0) {
                error.println("The coverage report file does not contain any $elementTag elements.")
                return
            }
            totalTrackingItems = fileElements.length.toLong()
            updateProgress(0)

            for (fileIndex in 0 until fileElements.length) {
                val fileElement = fileElements.item(fileIndex) as Element
                elementProcessor(fileElement, projectBuilder)
                updateProgress(fileIndex.toLong() + 1)
            }
        } catch (e: Exception) {
            error.println("Error while parsing XML file: ${e.message}")
            return
        }
    }

    fun parseXML(filePath: String): Document {
        val factory = DocumentBuilderFactory.newInstance()
        factory.setFeature("http://apache.org/xml/features/nonvalidating/load-dtd-grammar", false)
        factory.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false)

        val builder: DocumentBuilder = factory.newDocumentBuilder()
        return builder.parse(InputSource(FileInputStream(filePath)))
    }

    fun extractFileNameFromPath(path: String): String {
        val lastUnixPathSeparator = path.lastIndexOf('/')
        val lastWindowsPathSeparator = path.lastIndexOf('\\')

        val lastPathSeparatorIndex = maxOf(lastUnixPathSeparator, lastWindowsPathSeparator)

        if (lastPathSeparatorIndex < 0) return path

        if (path[lastPathSeparatorIndex] != File.separatorChar) {
            Logger.warn { "Non-native file paths detected in coverage report! This might result in an incorrect cc.json file" }
        }

        return path.substring(lastPathSeparatorIndex + 1)
    }

    fun removeExtraNodesAroundProject(projectBuilder: ProjectBuilder) {
        var newRoot = projectBuilder.rootNode
        while (newRoot.children.isNotEmpty() && newRoot.children.size == 1 && newRoot.children.first().type == NodeType.Folder) {
            newRoot = newRoot.children.first()
        }
        projectBuilder.rootNode.children = newRoot.children
    }
}
