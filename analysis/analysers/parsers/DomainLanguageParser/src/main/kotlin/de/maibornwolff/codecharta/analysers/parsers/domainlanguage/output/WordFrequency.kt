package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.output

data class WordFrequency(val text: String, val frequency: Int, val tfidf: Double? = null) {
    companion object {
        fun withScore(text: String, frequency: Int, tfidfScores: Map<String, Double>): WordFrequency =
            WordFrequency(text = text, frequency = frequency, tfidf = tfidfScores[text])
    }
}
