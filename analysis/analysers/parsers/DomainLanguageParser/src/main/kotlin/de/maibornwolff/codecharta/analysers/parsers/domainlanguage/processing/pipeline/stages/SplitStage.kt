package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.Language
import net.pearx.kasechange.splitToWords

class SplitStage(private val ngrams: Int = 1) {
    data class SplitResult(
        val words: List<WeightedText>,
        val sourceWords: List<String>, // Words from original identifier (for n-gram generation)
        val weight: Int,
        val context: ExtractionContext,
        val language: Language? = null
    )

    fun split(weightedTexts: List<WeightedText>): List<SplitResult> = weightedTexts.map { weighted ->
        val words =
            when (weighted.context) {
                ExtractionContext.IDENTIFIER -> splitIdentifier(weighted.text)
                ExtractionContext.COMMENT -> extractWords(weighted.text)
                ExtractionContext.STRING -> extractWords(withoutEscapes(weighted))
            }

        val weightedWords = words.map { WeightedText(it, weighted.weight, weighted.context, language = weighted.language) }

        SplitResult(
            words = weightedWords,
            sourceWords = words,
            weight = weighted.weight,
            context = weighted.context,
            language = weighted.language
        )
    }

    private fun withoutEscapes(string: WeightedText): String =
        if (string.interpretsEscapes) string.text.replace(ESCAPE_SEQUENCE_PATTERN, " ") else string.text

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
        private const val MIN_WORD_LENGTH = 2

        private const val MIN_MATCHED_RUN_LENGTH = 3
        private val WORD_PATTERN = Regex("""(?U)\b\p{L}{$MIN_MATCHED_RUN_LENGTH,}\b""")
        private val ESCAPE_SEQUENCE_PATTERN =
            Regex("""\\(?:u\{\p{XDigit}+}|u\p{XDigit}{4}|U\p{XDigit}{8}|x\p{XDigit}{1,2}|[0-7]{1,3}|.)""")
    }
}
