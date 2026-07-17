package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.stopwords

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
        lines
            .map { it.trim() }
            .filterNot { it.isEmpty() || it.startsWith("#") }
            .map { it.lowercase() }
            .toSet()
    }
}
