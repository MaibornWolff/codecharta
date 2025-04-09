package de.maibornwolff.codecharta.importer.coverage.strategies

import de.maibornwolff.codecharta.analysis.importer.coverage.CoverageAttributes
import de.maibornwolff.codecharta.analysis.importer.coverage.strategies.ImporterStrategy
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.progresstracker.ParsingUnit
import de.maibornwolff.codecharta.progresstracker.ProgressTracker
import org.w3c.dom.Document
import org.w3c.dom.Element
import org.xml.sax.InputSource
import java.io.File
import java.io.FileInputStream
import java.io.PrintStream
import javax.xml.parsers.DocumentBuilder
import javax.xml.parsers.DocumentBuilderFactory

class PHPStrategy : ImporterStrategy {
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

    private fun parseXML(filePath: String): Document {
        val factory = DocumentBuilderFactory.newInstance()
        factory.setFeature("http://apache.org/xml/features/nonvalidating/load-dtd-grammar", false)
        factory.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false)

        val builder: DocumentBuilder = factory.newDocumentBuilder()
        return builder.parse(InputSource(FileInputStream(filePath)))
    }

    private fun processFileElement(fileElement: Element, projectBuilder: ProjectBuilder) {
        val fileNode = createFileNode(fileElement)
        val pathRelativeToProjectRoot = PathFactory.fromFileSystemPath(fileElement.getAttribute("href")).parent
        projectBuilder.insertByPath(pathRelativeToProjectRoot, fileNode)
    }

    private fun createFileNode(fileElement: Element): MutableNode {
        val fileName = fileElement.getAttribute("name")
        val linesForFile = fileElement.getElementsByTagName("lines")
        if (linesForFile.length == 0) {
            throw IllegalStateException("No line-coverage information was found for the $fileName file! Please ensure the xml file is correctly formatted.")
        }
        if (linesForFile.length > 1) {
            throw IllegalStateException("More than one line-coverage was found for a file! Please ensure the xml file is in the default output format of phpunit.")
        }
        val lineReportForFile = linesForFile.item(0) as Element
        val lineCoverage = lineReportForFile.getAttribute("percent")

        val attributeMap = mutableMapOf(
            CoverageAttributes.LINE_COVERAGE.attributeName to lineCoverage,
        )

        return MutableNode(
            name = fileName,
            type = NodeType.File,
            attributes = attributeMap,
        )
    }
}
