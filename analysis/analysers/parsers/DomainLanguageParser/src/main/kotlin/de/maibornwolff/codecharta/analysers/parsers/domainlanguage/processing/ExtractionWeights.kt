package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

// Weight positivity is validated once, at the CLI boundary (DomainLanguageParser.validateOptions),
// where the failure can name the offending --*-weight option. This data class stays a plain carrier.
data class ExtractionWeights(val identifierWeight: Int = 3, val commentWeight: Int = 2, val stringWeight: Int = 1)
