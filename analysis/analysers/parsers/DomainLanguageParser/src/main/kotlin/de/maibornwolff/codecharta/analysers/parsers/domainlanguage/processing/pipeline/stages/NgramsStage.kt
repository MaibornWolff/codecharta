package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.ExtractionContext
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.WeightedText

class NgramsStage(private val ngrams: Int = 1, private val enableSsr: Boolean = true) {
    private val substringReduction = StatisticalSubstringReduction()

    fun generateNgrams(splitResults: List<SplitStage.SplitResult>): List<WeightedText> {
        if (ngrams <= 1) {
            return splitResults.flatMap { it.words }
        }

        val generated = splitResults.flatMap { splitResult -> splitResult.words + generateNgramsFor(splitResult) }

        return if (enableSsr) substringReduction.reduce(generated) else generated
    }

    private fun generateNgramsFor(splitResult: SplitStage.SplitResult): List<WeightedText> {
        if (splitResult.context != ExtractionContext.IDENTIFIER || splitResult.sourceWords.size < SMALLEST_NGRAM) {
            return emptyList()
        }

        val largestNgram = ngrams.coerceAtMost(splitResult.sourceWords.size)
        return (SMALLEST_NGRAM..largestNgram).flatMap { ngramSize ->
            splitResult.sourceWords.windowed(ngramSize, partialWindows = false).map { window ->
                WeightedText(window.joinToString(StatisticalSubstringReduction.WORD_SEPARATOR), splitResult.weight, splitResult.context)
            }
        }
    }

    companion object {
        private const val SMALLEST_NGRAM = 2
    }
}
