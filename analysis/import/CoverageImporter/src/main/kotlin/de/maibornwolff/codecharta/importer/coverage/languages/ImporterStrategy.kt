package de.maibornwolff.codecharta.importer.tokeiimporter.strategy

import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.serialization.FileExtension
import java.io.File

interface ImporterStrategy {
    val fileExtensions: List<FileExtension>

    fun buildCCJson(coverageFile: File, projectBuilder: ProjectBuilder)

    fun findCoverageFile(coverageFile: File): File


}
