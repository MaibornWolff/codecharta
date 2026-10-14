package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages

class WeightStage(private val weights: ExtractionWeights = ExtractionWeights()) {
    fun weight(extractedTexts: List<ExtractedText>): List<WeightedText> = extractedTexts
        .map { extracted -> WeightedText(extracted.text, weightOf(extracted.context), extracted.context) }
        .filter { it.weight > 0 }

    private fun weightOf(context: ExtractionContext): Int = when (context) {
        ExtractionContext.IDENTIFIER -> weights.identifierWeight
        ExtractionContext.COMMENT -> weights.commentWeight
        ExtractionContext.STRING -> weights.stringWeight
    }
}
