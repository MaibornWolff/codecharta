package de.maibornwolff.treesitter.excavationsite.languages.java

import de.maibornwolff.treesitter.excavationsite.languages.java.extractors.extractInstanceofPatternVariable
import de.maibornwolff.treesitter.excavationsite.languages.java.extractors.extractLambdaSingleParameter
import de.maibornwolff.treesitter.excavationsite.shared.domain.CommentFormats
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionStrategy
import de.maibornwolff.treesitter.excavationsite.shared.domain.StringFormats

/**
 * Java extraction definitions.
 */
object JavaExtractionMapping : ExtractionMapping {
    private const val IDENTIFIER = "identifier"
    private const val VARIABLE_DECLARATOR = "variable_declarator"
    private const val TYPE_IDENTIFIER = "type_identifier"

    override val nodeExtractions: Map<String, Extract> = buildMap {
        // Identifiers - simple first child
        put("class_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("interface_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("enum_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("record_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("annotation_type_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("method_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("constructor_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("annotation_type_element_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("formal_parameter", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("catch_formal_parameter", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("enum_constant", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("resource", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("enhanced_for_statement", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("type_pattern", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("record_pattern_component", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))

        // Identifiers - nested in variable declarator
        put("field_declaration", Extract.Identifier(single = ExtractionStrategy.NestedInChild(VARIABLE_DECLARATOR, IDENTIFIER)))
        put("local_variable_declaration", Extract.Identifier(single = ExtractionStrategy.NestedInChild(VARIABLE_DECLARATOR, IDENTIFIER)))
        put("spread_parameter", Extract.Identifier(single = ExtractionStrategy.NestedInChild(VARIABLE_DECLARATOR, IDENTIFIER)))

        // Identifiers - first child by multiple types
        put("type_parameter", Extract.Identifier(single = ExtractionStrategy.FirstChildByTypes(TYPE_IDENTIFIER, IDENTIFIER)))

        // Identifiers - multiple extraction
        put("inferred_parameters", Extract.Identifier(multi = ExtractionStrategy.AllChildrenByType(IDENTIFIER)))

        // Identifiers - custom extractors
        put("lambda_expression", Extract.Identifier(customSingle = ::extractLambdaSingleParameter))
        put("instanceof_expression", Extract.Identifier(customSingle = ::extractInstanceofPatternVariable))

        // Comments
        put("line_comment", Extract.Comment(CommentFormats.Line("//")))
        put("block_comment", Extract.Comment(CommentFormats.Block))

        // Strings
        put("string_literal", Extract.StringLiteral(format = StringFormats.JavaTextBlock))
    }
}
