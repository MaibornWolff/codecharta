package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.ExtractedText
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.ExtractionContext
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.api.ExtractionContext as LibraryExtractionContext

/**
 * Extract stage: Extracts identifiers, comments, and strings from source code using TreeSitterLibrary.
 *
 * This stage delegates to TreeSitterExtraction for AST-based text extraction.
 */
class ExtractStage(private val language: Language) {
    fun extract(sourceCode: String): List<ExtractedText> {
        if (sourceCode.isBlank()) {
            return emptyList()
        }

        val result = TreeSitterExtraction.extract(sourceCode, language)

        return result.extractedTexts.map { extracted ->
            ExtractedText(
                text = extracted.text,
                context =
                    when (extracted.context) {
                        LibraryExtractionContext.IDENTIFIER -> ExtractionContext.IDENTIFIER
                        LibraryExtractionContext.COMMENT -> ExtractionContext.COMMENT
                        LibraryExtractionContext.STRING -> ExtractionContext.STRING
                    }
            )
        }
    }
}
