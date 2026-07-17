package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.StopWordFilter
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.WeightedText
import java.nio.file.Path

/**
 * Filter stage: Removes stop words from weighted text list.
 *
 * This stage filters out:
 * - English stop words (the, a, an, etc.)
 * - Language keywords (class, fun, val, etc.)
 * - Technical stop words (test, util, manager, etc.)
 * - Custom stop words from .dlcignore
 * - Framework-specific keywords (scoped to files under framework directories)
 *
 * N-grams are filtered if ANY component word is a stop word.
 */
class FilterStage(private val stopWordFilter: StopWordFilter) {
    fun filter(weightedTexts: List<WeightedText>): List<WeightedText> = weightedTexts.filter { weighted ->
        !stopWordFilter.isExcluded(weighted.text)
    }

    fun filter(weightedTexts: List<WeightedText>, filePath: Path): List<WeightedText> = weightedTexts.filter { weighted ->
        !stopWordFilter.isExcluded(weighted.text, filePath)
    }
}
