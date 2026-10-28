package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common.splitNameToParts
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import java.io.File

/**
 * @property analysedFiles the paths below [analysisRoot] of every file the run analyses, as [physicalPath] is written;
 *   empty for a file analysed on its own, which then sees every file below the root
 */
data class FileInfo(
    val language: SupportedLanguage,
    val physicalPath: String,
    val content: String,
    val analysisRoot: File? = null,
    val analysedFiles: Set<String> = emptySet()
) {
    fun physicalPathAsPath() = Path(splitNameToParts(physicalPath))
}
