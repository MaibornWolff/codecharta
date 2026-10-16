package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages

data class ExtractionWeights(val identifierWeight: Int = 3, val commentWeight: Int = 2, val stringWeight: Int = 1) {
    /** A string weighing nothing stays left out, also where text weighs like identifiers. */
    fun weightOf(context: ExtractionContext, textWeighsLikeIdentifiers: Boolean = false): Int = when (context) {
        ExtractionContext.IDENTIFIER -> identifierWeight
        ExtractionContext.COMMENT -> commentWeight
        ExtractionContext.STRING -> if (textWeighsLikeIdentifiers && stringWeight > 0) identifierWeight else stringWeight
    }
}
