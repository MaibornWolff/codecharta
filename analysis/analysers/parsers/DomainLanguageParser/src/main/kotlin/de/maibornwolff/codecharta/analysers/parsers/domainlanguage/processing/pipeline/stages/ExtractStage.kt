package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.Language as DomainLanguage
import de.maibornwolff.treesitter.excavationsite.api.ExtractionContext as LibraryExtractionContext

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
                    },
                interpretsEscapes = extracted.interpretsEscapes,
                language = extracted.language?.let { DomainLanguage.ofLibraryLanguage(it) }
            )
        }
    }
}
