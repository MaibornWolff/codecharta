package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages

/** The text a user reads in a template weighs like an identifier, as it is what the template is about. */
data class ExtractionWeights(val identifierWeight: Int = 3, val commentWeight: Int = 2, val stringWeight: Int = 1) {
    fun weightOf(context: ExtractionContext): Int = when (context) {
        ExtractionContext.IDENTIFIER, ExtractionContext.TEXT -> identifierWeight
        ExtractionContext.COMMENT -> commentWeight
        ExtractionContext.STRING -> stringWeight
    }
}
