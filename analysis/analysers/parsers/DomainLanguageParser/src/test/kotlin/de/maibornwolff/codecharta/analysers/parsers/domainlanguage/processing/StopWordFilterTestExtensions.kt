package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import java.nio.file.Path
import java.nio.file.Paths

/**
 * Test-only conveniences for [StopWordFilter].
 *
 * Production code only ever asks "is this word excluded for this file?" via the path-aware
 * [StopWordFilter.isExcluded], so the batch-`filter` and path-less-`isExcluded` overloads were removed
 * from the production API. These extensions keep the exclusion-algorithm tests expressive while routing
 * every check through the one surviving entry point. [ANY_FILE_PATH] carries no framework scope, so a
 * path-less lookup resolves to the same global exclusion set the removed overloads used.
 */
private val ANY_FILE_PATH: Path = Paths.get("src/AnyFile.kt")

internal fun StopWordFilter.isExcluded(word: String): Boolean = isExcluded(word, ANY_FILE_PATH)

internal fun StopWordFilter.filter(words: List<String>, filePath: Path = ANY_FILE_PATH): List<String> =
    words.filter { !isExcluded(it, filePath) }
