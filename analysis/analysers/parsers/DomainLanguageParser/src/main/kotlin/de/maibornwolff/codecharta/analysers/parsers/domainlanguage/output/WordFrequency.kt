package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.output

/**
 * Represents a word and its frequency in the analyzed code.
 *
 * @property text The word text
 * @property frequency The number of occurrences
 * @property tfidf Optional TF-IDF score for ranking word importance. When `null` it is omitted from
 *   the emitted `domain` lens entirely (see [DomainProjectGenerator]).
 */
data class WordFrequency(val text: String, val frequency: Int, val tfidf: Double? = null)
