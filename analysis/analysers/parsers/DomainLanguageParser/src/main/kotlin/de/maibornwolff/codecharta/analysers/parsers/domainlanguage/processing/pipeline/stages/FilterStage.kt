package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.Language
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.StopWordFilter
import java.nio.file.Path

class FilterStage(private val stopWordFilter: StopWordFilter) {
    fun filter(weightedTexts: List<WeightedText>, filePath: Path, language: Language? = null): List<WeightedText> =
        weightedTexts.filter { weighted ->
            !stopWordFilter.isExcluded(weighted.text, filePath, language)
        }
}
