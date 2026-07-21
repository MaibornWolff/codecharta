package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.analysis

import kotlin.math.log10

/**
 * Calculates TF-IDF scores using corpus-level aggregation.
 *
 * Design: Aggregates term frequencies across all files rather than
 * normalizing per-file. This emphasizes globally distinctive terms,
 * useful for identifying domain concepts in specific code areas.
 */
class TfIdfCalculator {
    fun calculate(perFileFrequencies: Map<String, Map<String, Int>>): Map<String, Double> {
        val totalDocuments = perFileFrequencies.size

        if (totalDocuments <= 1) {
            return emptyMap()
        }

        val documentFrequency = countDocumentFrequency(perFileFrequencies)
        val termFrequency = sumTermFrequency(perFileFrequencies)

        return termFrequency.mapValues { (term, termCount) ->
            val documentCount = documentFrequency[term] ?: 0
            termCount * calculateIdf(totalDocuments, documentCount)
        }
    }

    private fun countDocumentFrequency(perFileFrequencies: Map<String, Map<String, Int>>): Map<String, Int> {
        val documentFrequency = mutableMapOf<String, Int>()
        for ((_, wordCounts) in perFileFrequencies) {
            for (term in wordCounts.keys) {
                documentFrequency[term] = (documentFrequency[term] ?: 0) + 1
            }
        }
        return documentFrequency
    }

    private fun sumTermFrequency(perFileFrequencies: Map<String, Map<String, Int>>): Map<String, Int> {
        val termFrequency = mutableMapOf<String, Int>()
        for ((_, wordCounts) in perFileFrequencies) {
            for ((term, count) in wordCounts) {
                termFrequency[term] = (termFrequency[term] ?: 0) + count
            }
        }
        return termFrequency
    }

    private fun calculateIdf(totalDocuments: Int, documentFrequency: Int): Double {
        if (documentFrequency == 0) return 0.0
        return log10(totalDocuments.toDouble() / documentFrequency)
    }
}
