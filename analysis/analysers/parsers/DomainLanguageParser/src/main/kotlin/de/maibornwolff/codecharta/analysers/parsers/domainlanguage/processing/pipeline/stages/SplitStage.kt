package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.ExtractionContext
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.WeightedText
import net.pearx.kasechange.splitToWords

/**
 * Split stage: Splits weighted text into individual words while preserving weights.
 *
 * For identifiers: Splits camelCase/PascalCase/snake_case into component words.
 * For comments/strings: Extracts words using regex pattern.
 *
 * Returns pairs of (individual words, original source text) to enable n-gram generation later.
 */
class SplitStage(private val ngrams: Int = 1) {
    data class SplitResult(
        val words: List<WeightedText>,
        val sourceWords: List<String>, // Words from original identifier (for n-gram generation)
        val weight: Int,
        val context: ExtractionContext
    )

    fun split(weightedTexts: List<WeightedText>): List<SplitResult> = weightedTexts.map { weighted ->
        val words =
            when (weighted.context) {
                ExtractionContext.IDENTIFIER -> splitIdentifier(weighted.text)
                ExtractionContext.COMMENT, ExtractionContext.STRING -> extractWords(weighted.text)
            }

        val weightedWords = words.map { WeightedText(it, weighted.weight, weighted.context) }

        SplitResult(
            words = weightedWords,
            sourceWords = words,
            weight = weighted.weight,
            context = weighted.context
        )
    }

    private fun splitIdentifier(identifier: String): List<String> = identifier
        .splitToWords()
        .map { sanitize(it) }
        .filter { isSignificantWord(it) }

    private fun extractWords(text: String): List<String> = WORD_PATTERN
        .findAll(text)
        .flatMap { it.value.splitToWords() }
        .map { sanitize(it) }
        .filter { isSignificantWord(it) }
        .toList()

    private fun sanitize(word: String): String = word.filter { it.isLetterOrDigit() }.lowercase()

    private fun isSignificantWord(word: String): Boolean = word.length >= MIN_WORD_LENGTH

    companion object {
        /** Shortest word the splitter may emit. */
        private const val MIN_WORD_LENGTH = 2

        /** Shortest letter run the splitter will even look at — gates the input, not the output. */
        private const val MIN_MATCHED_RUN_LENGTH = 3
        private val WORD_PATTERN = Regex("""\b[a-zA-Z]{$MIN_MATCHED_RUN_LENGTH,}\b""")
    }
}
