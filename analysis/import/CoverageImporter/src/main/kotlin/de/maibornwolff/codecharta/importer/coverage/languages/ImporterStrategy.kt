package de.maibornwolff.codecharta.importer.coverage.languages

import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.progresstracker.ProgressTracker
import de.maibornwolff.codecharta.serialization.FileExtension
import de.maibornwolff.codecharta.util.ResourceSearchHelper.Companion.endsWithAtLeastOne
import de.maibornwolff.codecharta.util.ResourceSearchHelper.Companion.getFileFromStringIfExists
import de.maibornwolff.codecharta.util.ResourceSearchHelper.Companion.isFileWithOneOrMoreOfEndingsPresent
import java.io.File
import java.io.FileNotFoundException

interface ImporterStrategy {
    val fileExtensions: List<FileExtension>
    val defaultReportFileName: String
    val progressTracker: ProgressTracker
    var totalLines: Long

    fun buildCCJson(coverageFile: File, projectBuilder: ProjectBuilder)

    fun updateProgress(parsedLines: Long) {
        progressTracker.updateProgress(totalLines, parsedLines, "lines")
    }

    fun getReportFileFromString(resourceToSearch: String): File {
        val existingFileOrDirectory = getFileFromStringIfExists(resourceToSearch)
            ?: throw FileNotFoundException("File not found: $resourceToSearch")
        if (existingFileOrDirectory.isFile) {
            val knownFileExtensions = fileExtensions.map { it.extension }
            if (endsWithAtLeastOne(existingFileOrDirectory.name, knownFileExtensions)) {
                return existingFileOrDirectory
            }
            throw FileNotFoundException("File: $resourceToSearch does not match any known file extension: $knownFileExtensions")
        }

        println(
            "Given resource did not match with the default file name. " +
                "Scanning directory `${existingFileOrDirectory.absolutePath}` for matching files."
        )

        val foundFiles = existingFileOrDirectory.walk().asSequence().filter {
            it.isFile && it.name.equals(defaultReportFileName)
        }.toList()

        if (foundFiles.isEmpty()) {
            throw FileNotFoundException("No matching files found in directory: ${existingFileOrDirectory.absolutePath}")
        }

        if (foundFiles.size > 1) {
            throw FileNotFoundException(
                "Multiple matching files found in directory: ${existingFileOrDirectory.absolutePath}. Please specify only one."
            )
        }

        return foundFiles.first()
    }

    fun isApplicable(resourceToBeParsed: String): Boolean {
        return isFileWithOneOrMoreOfEndingsPresent(resourceToBeParsed, fileExtensions.map { it.extension })
    }
}
