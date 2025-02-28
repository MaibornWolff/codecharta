package de.maibornwolff.codecharta.importer.tokeiimporter.strategy

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.serialization.FileExtension
import java.io.File

class JavaScriptTypeScriptStrategy : ImporterStrategy {
    override val fileExtensions: List<FileExtension> = listOf(FileExtension.JS_TS_COVERAGE)
    override val defaultReportFileName: String = "lcov.info"

    override fun buildCCJson(coverageFile: File, projectBuilder: ProjectBuilder) {
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
                        val (directoryPath, fileName) = splitFilePath(filePath)
                        val path = PathFactory.fromFileSystemPath(directoryPath)

                        val lineCoverage = calculatePercentage(linesHit, linesFound)
                        val branchCoverage = calculatePercentage(branchesHit, branchesFound)
                        val statementCoverage = calculatePercentage(functionsHit, functionsFound)

                        val node = MutableNode(
                            name = fileName,
                            type = NodeType.File,
                            attributes = mutableMapOf(
                                "line_coverage" to lineCoverage,
                                "branch_coverage" to branchCoverage,
                                "statement_coverage" to statementCoverage
                            )
                        )

                        projectBuilder.insertByPath(path, node)
                    }
                    currentFilePath = null
                }
            }
        }
    }

    private fun splitFilePath(fullPath: String): Pair<String, String> {
        return if (fullPath.contains("/")) {
            val lastSlashIndex = fullPath.lastIndexOf("/")
            fullPath.substring(0, lastSlashIndex) to fullPath.substring(lastSlashIndex + 1)
        } else {
            "" to fullPath
        }
    }

    private fun calculatePercentage(numerator: Int, denominator: Int): Double {
        return if (denominator > 0) (numerator.toDouble() / denominator) * 100 else 0.0
    }

    override fun findCoverageFile(coverageFile: File): File {
        TODO("Not yet implemented")
    }
}
