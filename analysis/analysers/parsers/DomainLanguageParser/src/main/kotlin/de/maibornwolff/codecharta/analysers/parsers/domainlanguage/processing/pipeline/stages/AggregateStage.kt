package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.WeightedText

/**
 * Aggregate stage: Converts a list of weighted text to a frequency map.
 *
 * This stage sums up all weights for each unique text to produce the final word frequency counts.
 */
class AggregateStage {
    fun aggregate(weightedTexts: List<WeightedText>): Map<String, Int> {
        val wordCounts = mutableMapOf<String, Int>()

        weightedTexts.forEach { weighted ->
            wordCounts.merge(weighted.text, weighted.weight, Int::plus)
        }

        return wordCounts
    }
}
