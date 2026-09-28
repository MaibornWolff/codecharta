package de.maibornwolff.treesitter.excavationsite.languages.bash

import de.maibornwolff.treesitter.excavationsite.languages.bash.extractors.extractAliasName
import de.maibornwolff.treesitter.excavationsite.shared.domain.CommentFormats
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionStrategy
import de.maibornwolff.treesitter.excavationsite.shared.domain.StringFormats

/**
 * Bash extraction definitions.
 */
object BashExtractionMapping : ExtractionMapping {
    private const val WORD = "word"
    private const val VARIABLE_NAME = "variable_name"

    override val nodeExtractions: Map<String, Extract> = buildMap {
        // Identifiers - function definitions
        put("function_definition", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(WORD)))

        // Identifiers - variable assignments and loop variables
        put("variable_assignment", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(VARIABLE_NAME)))
        put("for_statement", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(VARIABLE_NAME)))
        put("select_statement", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(VARIABLE_NAME)))

        // Identifiers - custom extractor for alias definitions
        put("command", Extract.Identifier(customSingle = ::extractAliasName))

        // Comments
        put("comment", Extract.Comment(CommentFormats.Line("#")))

        // Strings
        put("string", Extract.StringLiteral(format = StringFormats.Quoted()))
        put("raw_string", Extract.StringLiteral(format = StringFormats.Quoted(stripSingleQuotes = true)))
        put("heredoc_body", Extract.StringLiteral(format = StringFormats.Trimmed))
    }
}
