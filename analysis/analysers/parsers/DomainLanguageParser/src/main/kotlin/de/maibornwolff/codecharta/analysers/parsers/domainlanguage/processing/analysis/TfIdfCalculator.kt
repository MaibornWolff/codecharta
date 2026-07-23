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
    private data class CorpusFrequencies(val perDocument: Map<String, Int>, val total: Map<String, Int>)

    fun calculate(perFileFrequencies: Map<String, Map<String, Int>>): Map<String, Double> {
        val totalDocuments = perFileFrequencies.size

        if (totalDocuments <= 1) {
            return emptyMap()
        }

        val corpusFrequencies = aggregateCorpus(perFileFrequencies)

        return corpusFrequencies.total.mapValues { (term, termCount) ->
            val documentCount = corpusFrequencies.perDocument[term] ?: 0
            termCount * calculateIdf(totalDocuments, documentCount)
        }
    }

    // Both frequencies come out of a single corpus traversal: a term in a file's map contributes one
    // document to its document frequency and its count to its total frequency.
    private fun aggregateCorpus(perFileFrequencies: Map<String, Map<String, Int>>): CorpusFrequencies {
        val documentFrequency = mutableMapOf<String, Int>()
        val termFrequency = mutableMapOf<String, Int>()

        for (wordCounts in perFileFrequencies.values) {
            for ((term, count) in wordCounts) {
                documentFrequency.merge(term, 1, Int::plus)
                termFrequency.merge(term, count, Int::plus)
            }
        }

        return CorpusFrequencies(perDocument = documentFrequency, total = termFrequency)
    }

    private fun calculateIdf(totalDocuments: Int, documentFrequency: Int): Double {
        if (documentFrequency == 0) return 0.0
        return log10(totalDocuments.toDouble() / documentFrequency)
    }
}
