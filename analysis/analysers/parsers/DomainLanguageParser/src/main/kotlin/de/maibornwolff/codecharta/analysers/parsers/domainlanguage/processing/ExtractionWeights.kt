package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

data class ExtractionWeights(val identifierWeight: Int = 3, val commentWeight: Int = 2, val stringWeight: Int = 1) {
    init {
        require(identifierWeight > 0) { "Identifier weight must be positive, got $identifierWeight" }
        require(commentWeight > 0) { "Comment weight must be positive, got $commentWeight" }
        require(stringWeight > 0) { "String weight must be positive, got $stringWeight" }
    }
}
