package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import java.nio.file.Path
import java.nio.file.Paths

private val ANY_FILE_PATH: Path = Paths.get("src/AnyFile.kt")

internal fun StopWordFilter.isExcluded(word: String): Boolean = isExcluded(word, ANY_FILE_PATH)

internal fun StopWordFilter.filter(words: List<String>, filePath: Path = ANY_FILE_PATH): List<String> =
    words.filter { !isExcluded(it, filePath) }
