package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.WeightedText

/**
 * Drops an n-gram when a longer n-gram contains it as a contiguous word subsequence and occurs at least
 * as often, so the shorter one carries no information the longer one does not already carry. Unigrams are
 * never dropped.
 */
class StatisticalSubstringReduction {
    private data class Ngram(val text: String, val words: List<String>, val frequency: Int) {
        fun subsumes(other: Ngram): Boolean = words.size > other.words.size &&
            other.frequency <= frequency &&
            containsWordSubsequence(words, other.words)
    }

    fun reduce(weightedTexts: List<WeightedText>): List<WeightedText> {
        val ngrams = toNgrams(weightedTexts)
        if (ngrams.size <= 1) {
            return weightedTexts
        }

        val redundantNgrams = ngrams.filter { candidate -> ngrams.any { it.subsumes(candidate) } }.mapTo(mutableSetOf()) { it.text }
        return weightedTexts.filter { it.text !in redundantNgrams }
    }

    // Unigrams carry no separator, which is what keeps them out of the reduction entirely.
    private fun toNgrams(weightedTexts: List<WeightedText>): List<Ngram> = weightedTexts
        .groupBy { it.text }
        .filterKeys { it.contains(WORD_SEPARATOR) }
        .map { (text, occurrences) -> Ngram(text, text.split(WORD_SEPARATOR), occurrences.sumOf { it.weight }) }

    companion object {
        const val WORD_SEPARATOR = " "

        /**
         * Whole words are compared, so "user profile" is not considered contained in "superuser profile".
         */
        private fun containsWordSubsequence(longer: List<String>, shorter: List<String>): Boolean =
            longer.windowed(shorter.size).any { it == shorter }
    }
}
