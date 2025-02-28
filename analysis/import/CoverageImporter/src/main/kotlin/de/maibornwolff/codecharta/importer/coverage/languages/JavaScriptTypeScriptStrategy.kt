package de.maibornwolff.codecharta.importer.tokeiimporter.strategy

import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.PathFactory
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.serialization.FileExtension
import java.io.File

class JavaScriptTypeScriptStrategy : ImporterStrategy {
    override val fileExtensions: List<FileExtension> = listOf(FileExtension.JS_TS_COVERAGE)

    override fun buildCCJson(coverageFile: File, projectBuilder: ProjectBuilder) {
        // Set the project name (optional, based on your requirements)
        // Note: ProjectBuilder doesn't have a direct method to set the project name,
        // so it might need to be set during the build process.

        // Initialize variables to hold coverage data
        var currentFile: String? = null
        var linesFound: Int = 0
        var linesHit: Int = 0
        var branchesFound: Int = 0
        var branchesHit: Int = 0

        // Read the lcov.info file
        coverageFile.bufferedReader().use { reader ->
            reader.forEachLine { line ->
                when {
                    line.startsWith("SF:") -> {
                        // When encountering a new source file, reset metrics
                        currentFile = line.removePrefix("SF:").trim()
                        linesFound = 0
                        linesHit = 0
                        branchesFound = 0
                        branchesHit = 0
                    }
                    line.startsWith("LF:") -> {
                        linesFound = line.removePrefix("LF:").trim().toIntOrNull() ?: 0
                    }
                    line.startsWith("LH:") -> {
                        linesHit = line.removePrefix("LH:").trim().toIntOrNull() ?: 0
                    }
                    line.startsWith("BRF:") -> {
                        branchesFound = line.removePrefix("BRF:").trim().toIntOrNull() ?: 0
                    }
                    line.startsWith("BRH:") -> {
                        branchesHit = line.removePrefix("BRH:").trim().toIntOrNull() ?: 0
                    }
                    line == "end_of_record" -> {
                        // When the end of a record is reached, process the collected data
                        currentFile?.let { filePath ->
                            // Calculate coverage metrics
                            val lineCoverage = if (linesFound > 0) {
                                (linesHit.toDouble() / linesFound) * 100
                            } else {
                                0.0
                            }
                            val branchCoverage = if (branchesFound > 0) {
                                (branchesHit.toDouble() / branchesFound) * 100
                            } else {
                                0.0
                            }
                            val statementCoverage = lineCoverage // Assuming equivalent to line coverage

                            // Create a MutableNode with coverage attributes
                            val node = MutableNode(
                                name = filePath,
                                type = NodeType.File, // Assuming NodeType.File exists
                                attributes = mapOf(
                                    "line_coverage" to lineCoverage,
                                    "branch_coverage" to branchCoverage,
                                    "statement_coverage" to statementCoverage
                                ).toMutableMap()
                            )

                            // Determine the directory and file name
                            val sanitizedPath = filePath.replace("\\", "/") // Ensure consistent path separators
                            val directory = sanitizedPath.substringBeforeLast("/", "root")
                            val fileName = sanitizedPath.substringAfterLast("/")

                            // Create a Path object
                            val path = PathFactory.fromFileSystemPath(directory)

                            // Insert the node into the ProjectBuilder
                            projectBuilder.insertByPath(path, node)
                        }

                        // Reset currentFile after processing
                        currentFile = null
                    }
                }
            }
        }
    }

    override fun findCoverageFile(coverageFile: File): File {
        TODO("Not yet implemented")
    }
}
