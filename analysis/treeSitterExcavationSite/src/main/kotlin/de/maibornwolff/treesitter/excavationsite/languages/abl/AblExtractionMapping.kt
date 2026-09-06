package de.maibornwolff.treesitter.excavationsite.languages.abl

import de.maibornwolff.treesitter.excavationsite.languages.abl.extractors.extractAblMethodName
import de.maibornwolff.treesitter.excavationsite.shared.domain.CommentFormats
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionStrategy
import de.maibornwolff.treesitter.excavationsite.shared.domain.StringFormats

/**
 * ABL (OpenEdge ABL/Progress 4GL) extraction definitions.
 */
object AblExtractionMapping : ExtractionMapping {
    private const val IDENTIFIER = "identifier"

    override val nodeExtractions: Map<String, Extract> = buildMap {
        // Identifiers - procedure and function definitions
        put("procedure_definition", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("function_definition", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))

        // Identifiers - class and interface definitions
        put("class_definition", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("interface_definition", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))

        // Identifiers - method and constructor definitions (OO constructs)
        put("method_definition", Extract.Identifier(customSingle = ::extractAblMethodName))
        put("constructor_definition", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))

        // Identifiers - variable definitions
        put("variable_definition", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("parameter_definition", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("method_parameter", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("function_parameter", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))

        // Identifiers - catch statement (exception variable)
        put("catch_statement", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))

        // Identifiers - FOR EACH buffer/table names
        put("for_record", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))

        // Identifiers - buffer and temp-table definitions
        put("buffer_definition", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("temp_table_definition", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("dataset_definition", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))

        // Identifiers - property definitions (class properties)
        put("property_definition", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))

        // Identifiers - enum definitions
        put("enum_statement", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("enum_member", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))

        // Comments (comment is the parent node containing line_comment or block_comment)
        put("comment", Extract.Comment(CommentFormats.AutoDetect))

        // Strings - ABL uses double quotes and single quotes
        put("string_literal", Extract.StringLiteral(format = StringFormats.Quoted(stripSingleQuotes = true)))
    }
}
