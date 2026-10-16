package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.Language

class WeightStage(private val weights: ExtractionWeights = ExtractionWeights(), private val language: Language? = null) {
    fun weight(extractedTexts: List<ExtractedText>): List<WeightedText> = extractedTexts
        .map { extracted ->
            val textLanguage = extracted.language ?: language
            val weight = weights.weightOf(extracted.context, textLanguage?.textWeighsLikeIdentifiers == true)
            WeightedText(extracted.text, weight, extracted.context, extracted.interpretsEscapes, extracted.language)
        }.filter { it.weight > 0 }
}
