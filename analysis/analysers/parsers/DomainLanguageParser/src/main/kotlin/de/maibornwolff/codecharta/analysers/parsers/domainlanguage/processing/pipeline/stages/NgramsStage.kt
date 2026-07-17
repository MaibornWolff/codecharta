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
     * Apply Statistical Substring Reduction to filter redundant n-grams.
     *
     * Algorithm:
     * 1. Group weighted texts by text content, sum weights to get frequencies
     * 2. Pre-split all n-grams into word lists (avoid repeated splitting)
     * 3. Group n-grams by word count for efficient comparison
     * 4. For each shorter n-gram, only check longer n-grams (reduces comparisons)
     * 5. Use word-based subsequence check and early termination
     * 6. If substring frequency ≤ containing n-gram frequency, mark for removal
     * 7. Return filtered list
     */
    private fun applyStatisticalSubstringReduction(weightedTexts: List<WeightedText>): List<WeightedText> {
        // Step 1: Calculate frequencies (sum of weights for each unique text)
        val frequencies = weightedTexts.groupBy { it.text }.mapValues { (_, texts) -> texts.sumOf { it.weight } }

        // Separate unigrams from n-grams
        val ngramFrequencies = frequencies.filter { (text, _) -> text.contains(" ") }

        if (ngramFrequencies.size <= 1) {
            return weightedTexts
        }

        // Step 2: Pre-split all n-grams into word lists (avoid repeated splitting)
        val ngramWords: Map<String, List<String>> = ngramFrequencies.keys.associateWith { it.split(" ") }

        // Step 3: Group n-grams by word count for efficient comparison
        val ngramsByWordCount: Map<Int, List<Pair<String, List<String>>>> =
            ngramWords.entries.groupBy(
                keySelector = { it.value.size },
                valueTransform = { it.key to it.value }
            )
        val wordCounts = ngramsByWordCount.keys.sorted()

        // Step 4: Find n-grams to remove (only compare shorter to longer)
        val textsToRemove = mutableSetOf<String>()

        for (shorterWordCount in wordCounts.dropLast(1)) {
            val shorterNgrams = ngramsByWordCount[shorterWordCount] ?: continue

            for ((shorterNgram, shorterWords) in shorterNgrams) {
                if (shorterNgram in textsToRemove) continue

                val shorterFreq = ngramFrequencies[shorterNgram] ?: continue

                // Step 5: Only check n-grams with more words, use early termination
                val found =
                    wordCounts
                        .asSequence()
                        .filter { it > shorterWordCount }
                        .any { longerWordCount ->
                            val longerNgrams = ngramsByWordCount[longerWordCount] ?: emptyList()
                            longerNgrams.any { (longerNgram, longerWords) ->
                                val longerFreq = ngramFrequencies[longerNgram] ?: 0
                                // Word-based containment check
                                containsWordSubsequence(longerWords, shorterWords) && shorterFreq <= longerFreq
                            }
                        }

                if (found) {
                    textsToRemove.add(shorterNgram)
                }
            }
        }

        // Step 7: Filter out removed n-grams
        return weightedTexts.filter { it.text !in textsToRemove }
    }

    /**
     * Checks if the longer word list contains the shorter word list as a contiguous subsequence.
     * Uses joinToString for the actual comparison to avoid character-by-character iteration.
     */
    private fun containsWordSubsequence(longer: List<String>, shorter: List<String>): Boolean {
        if (shorter.size >= longer.size) return false
        val shortStr = shorter.joinToString(" ")
        val longStr = longer.joinToString(" ")
        return longStr.contains(shortStr)
    }
}
