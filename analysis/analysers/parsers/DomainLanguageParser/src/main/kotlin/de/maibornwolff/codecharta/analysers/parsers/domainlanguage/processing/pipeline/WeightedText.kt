package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline

/**
 * Represents text with an associated weight and extraction context.
 *
 * @property text The text content
 * @property weight The numeric weight applied to this text
 * @property context The extraction context (used by split stage)
 */
data class WeightedText(val text: String, val weight: Int, val context: ExtractionContext)
