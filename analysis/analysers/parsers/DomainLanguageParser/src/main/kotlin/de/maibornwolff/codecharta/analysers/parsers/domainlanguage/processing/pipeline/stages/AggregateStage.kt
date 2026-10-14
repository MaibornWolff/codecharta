package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages

class AggregateStage {
    fun aggregate(weightedTexts: List<WeightedText>): Map<String, Int> {
        val wordCounts = mutableMapOf<String, Int>()

        weightedTexts.forEach { weighted ->
            wordCounts.merge(weighted.text, weighted.weight, Int::plus)
        }

        return wordCounts
    }
}
