package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages

data class WeightedText(val text: String, val weight: Int, val context: ExtractionContext)
