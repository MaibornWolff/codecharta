package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.ExtractionContext
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.WeightedText

/**
 * N-grams stage: Generates n-grams from identifier words while preserving individual words.
 *
 * For identifiers with ngrams > 1, this stage generates both individual words and compound phrases.
 * For comments/strings, only individual words are kept (no n-grams generated).
 *
 * After generation, applies Statistical Substring Reduction (SSR) to remove redundant n-grams.
 * SSR rule: If an n-gram (n≥2) is a substring of a longer n-gram and has equal or lower frequency,
 * the shorter one is removed.
 *
 * Example with ngrams=2:
 *   Input: "userProfile" (split to ["user", "profile"])
 *   Output: ["user", "profile", "user profile"]
 */
class NgramsStage(private val ngrams: Int = 1, private val enableSsr: Boolean = true) {
    fun generateNgrams(splitResults: List<SplitStage.SplitResult>): List<WeightedText> {
        if (ngrams <= 1) {
            return splitResults.flatMap { it.words }
        }

        val result = mutableListOf<WeightedText>()

        splitResults.forEach { splitResult ->
            // Add all individual words
            result.addAll(splitResult.words)

            // Generate n-grams only for identifiers
            if (splitResult.context == ExtractionContext.IDENTIFIER && splitResult.sourceWords.size >= 2) {
                for (n in 2..ngrams.coerceAtMost(splitResult.sourceWords.size)) {
                    splitResult.sourceWords.windowed(n, partialWindows = false).forEach { window ->
                        val ngramText = window.joinToString(" ")
                        result.add(WeightedText(ngramText, splitResult.weight, splitResult.context))
                    }
                }
            }
        }

        return if (enableSsr) applyStatisticalSubstringReduction(result) else result
    }

    /**
     * Applies Statistical Substring Reduction: drops an n-gram when a longer n-gram contains it as a
     * contiguous word subsequence and occurs at least as often, so the shorter one carries no
     * information the longer one does not already carry. Unigrams are never dropped.
     */
    private fun applyStatisticalSubstringReduction(weightedTexts: List<WeightedText>): List<WeightedText> {
        val ngramFrequencies = sumFrequenciesByText(weightedTexts).filter { (text, _) -> text.contains(" ") }
        if (ngramFrequencies.size <= 1) {
            return weightedTexts
        }

        val ngramsByWordCount = groupNgramsByWordCount(ngramFrequencies.keys)
        val redundantNgrams = findRedundantNgrams(ngramsByWordCount, ngramFrequencies)
        return weightedTexts.filter { it.text !in redundantNgrams }
    }

    private fun sumFrequenciesByText(weightedTexts: List<WeightedText>): Map<String, Int> = weightedTexts
        .groupBy {
            it.text
        }.mapValues { (_, texts) -> texts.sumOf { it.weight } }

    /** Grouped by word count so each n-gram is only ever compared against strictly longer ones. */
    private fun groupNgramsByWordCount(ngrams: Set<String>): Map<Int, List<Pair<String, List<String>>>> = ngrams
        .associateWith { it.split(" ") }
        .entries
        .groupBy(keySelector = { it.value.size }, valueTransform = { it.key to it.value })

    private fun findRedundantNgrams(
        ngramsByWordCount: Map<Int, List<Pair<String, List<String>>>>,
        ngramFrequencies: Map<String, Int>
    ): Set<String> {
        val wordCounts = ngramsByWordCount.keys.sorted()
        val redundantNgrams = mutableSetOf<String>()

        for (shorterWordCount in wordCounts.dropLast(1)) {
            for ((shorterNgram, shorterWords) in ngramsByWordCount[shorterWordCount].orEmpty()) {
                if (shorterNgram in redundantNgrams) continue
                val shorterFrequency = ngramFrequencies[shorterNgram] ?: continue

                val isSubsumed =
                    wordCounts
                        .asSequence()
                        .filter { it > shorterWordCount }
                        .any { longerWordCount ->
                            ngramsByWordCount[longerWordCount].orEmpty().any { (longerNgram, longerWords) ->
                                containsWordSubsequence(longerWords, shorterWords) &&
                                    shorterFrequency <= (ngramFrequencies[longerNgram] ?: 0)
                            }
                        }

                if (isSubsumed) {
                    redundantNgrams.add(shorterNgram)
                }
            }
        }
        return redundantNgrams
    }

    /**
     * Checks if the longer word list contains the shorter word list as a contiguous subsequence.
     * Compares whole words, so "user profile" is not considered contained in "superuser profile".
     */
    private fun containsWordSubsequence(longer: List<String>, shorter: List<String>): Boolean {
        if (shorter.size >= longer.size) return false
        return longer.windowed(shorter.size).any { it == shorter }
    }
}
