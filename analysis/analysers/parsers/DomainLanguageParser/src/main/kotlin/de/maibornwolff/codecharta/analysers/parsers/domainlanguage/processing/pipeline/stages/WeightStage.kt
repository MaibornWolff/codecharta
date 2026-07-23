package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.ExtractionWeights
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.ExtractedText
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.ExtractionContext
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.WeightedText

class WeightStage(private val weights: ExtractionWeights = ExtractionWeights()) {
    fun weight(extractedTexts: List<ExtractedText>): List<WeightedText> = extractedTexts.map { extracted ->
        val weight =
            when (extracted.context) {
                ExtractionContext.IDENTIFIER -> weights.identifierWeight
                ExtractionContext.COMMENT -> weights.commentWeight
                ExtractionContext.STRING -> weights.stringWeight
            }
        WeightedText(extracted.text, weight, extracted.context)
    }
}
