package de.maibornwolff.treesitter.excavationsite.api

import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractedText
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionResult

// Re-export from extraction.model package for public API backward compatibility
typealias ExtractionContext = ExtractionContext
typealias ExtractionResult = ExtractionResult
typealias ExtractedText = ExtractedText
