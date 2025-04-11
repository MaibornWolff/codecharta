package de.maibornwolff.codecharta.analysers.importers.coverage.strategies

import de.maibornwolff.codecharta.analysers.importers.coverage.CoverageAttributes
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.progresstracker.ParsingUnit
import de.maibornwolff.codecharta.progresstracker.ProgressTracker
import java.io.File
import java.io.PrintStream

class JavaScriptStrategy() : ImporterStrategy {
    override val progressTracker: ProgressTracker = ProgressTracker()
    override var totalTrackingItems: Long = 0
    override val parsingUnit: ParsingUnit = ParsingUnit.Lines

    override fun addNodesToProjectBuilder(coverageFile: File, projectBuilder: ProjectBuilder, error: PrintStream) {
        totalTrackingItems = coverageFile.readLines().size.toLong()
        if (totalTrackingItems == 0L) {
            error.println("The coverage file is empty.")
            return
        }
        var currentLine: Long = 0
        updateProgress(currentLine)

        var currentFilePath: String? = null
        var linesFound = 0
        var linesHit = 0
        var functionsFound = 0
        var functionsHit = 0
        var branchesFound = 0
        var branchesHit = 0

        coverageFile.forEachLine { line ->
            when {
                line.startsWith("SF:") -> {
                    currentFilePath = line.substringAfter("SF:").trim()
                    linesFound = 0
                    linesHit = 0
                    functionsFound = 0
                    functionsHit = 0
                    branchesFound = 0
                    branchesHit = 0
                }
                line.startsWith("LF:") -> linesFound = line.substringAfter("LF:").trim().toInt()
                line.startsWith("LH:") -> linesHit = line.substringAfter("LH:").trim().toInt()
                line.startsWith("FNF:") -> functionsFound = line.substringAfter("FNF:").trim().toInt()
                line.startsWith("FNH:") -> functionsHit = line.substringAfter("FNH:").trim().toInt()
                line.startsWith("BRF:") -> branchesFound = line.substringAfter("BRF:").trim().toInt()
                line.startsWith("BRH:") -> branchesHit = line.substringAfter("BRH:").trim().toInt()
                line == "end_of_record" -> {
                    currentFilePath?.let { filePath ->
                        val file = File(filePath)
                        val fileName = file.name
                        val directoryPath = file.parent ?: ""
                        val path = PathFactory.fromFileSystemPath(directoryPath, File.separatorChar)

                        val lineCoverage = calculatePercentage(linesHit, linesFound)
                        val branchCoverage = calculatePercentage(branchesHit, branchesFound)
                        val statementCoverage = calculatePercentage(functionsHit, functionsFound)

                        val node = MutableNode(
                            name = fileName,
                            type = NodeType.File,
                            attributes = mutableMapOf(
                                CoverageAttributes.LINE_COVERAGE.attributeName to lineCoverage,
                                CoverageAttributes.BRANCH_COVERAGE.attributeName to branchCoverage,
                                CoverageAttributes.STATEMENT_COVERAGE.attributeName to statementCoverage
                            )
                        )

                        projectBuilder.insertByPath(path, node)
                    }
                    currentFilePath = null
                }
            }
            updateProgress(++currentLine)
        }
    }
}
