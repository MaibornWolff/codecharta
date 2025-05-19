package de.maibornwolff.codecharta.analysers.parsers.unified.metricqueries.typescript

interface MetricQueries {
    val complexityQuery: String
    //TODO: add more queries

    fun getAllQueries(): Map<String, String> {
        return mapOf(
            "complexity" to complexityQuery
        )
    }
}
