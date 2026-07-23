package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.WeightedText

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

    private fun toNgrams(weightedTexts: List<WeightedText>): List<Ngram> = weightedTexts
        .groupBy { it.text }
        .filterKeys { it.contains(WORD_SEPARATOR) }
        .map { (text, occurrences) -> Ngram(text, text.split(WORD_SEPARATOR), occurrences.sumOf { it.weight }) }

    companion object {
        const val WORD_SEPARATOR = " "

        private fun containsWordSubsequence(longer: List<String>, shorter: List<String>): Boolean =
            longer.windowed(shorter.size).any { it == shorter }
    }
}
