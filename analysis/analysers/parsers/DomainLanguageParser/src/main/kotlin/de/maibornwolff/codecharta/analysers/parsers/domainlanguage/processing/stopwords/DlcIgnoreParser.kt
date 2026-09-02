package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.stopwords

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.parseWordLines
import java.io.File
import java.nio.file.Path

class DlcIgnoreParser {
    fun loadCustomStopWords(directoryPath: Path): Set<String> {
        val dlcIgnoreFile = directoryPath.resolve(".dlcignore").toFile()

        if (!dlcIgnoreFile.exists() || !dlcIgnoreFile.isFile) {
            return emptySet()
        }

        return parseDlcIgnoreFile(dlcIgnoreFile)
    }

    private fun parseDlcIgnoreFile(file: File): Set<String> = file.bufferedReader().useLines { lines ->
        parseWordLines(lines)
    }
}
