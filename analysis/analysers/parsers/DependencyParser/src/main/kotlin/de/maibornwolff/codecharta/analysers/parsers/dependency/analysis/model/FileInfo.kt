package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common.splitNameToParts
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import java.io.File

data class FileInfo(val language: SupportedLanguage, val physicalPath: String, val content: String, val analysisRoot: File? = null) {
    fun physicalPathAsPath() = Path(splitNameToParts(physicalPath))
}
