package de.maibornwolff.treesitter.excavationsite.languages.kotlin

import de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors.extractAnnotationClassFromInfixExpression
import de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors.extractLabelIdentifier
import de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors.extractLambdaParameterIdentifiers
import de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors.extractPropertyIdentifiers
import de.maibornwolff.treesitter.excavationsite.shared.domain.CommentFormats
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionStrategy
import de.maibornwolff.treesitter.excavationsite.shared.domain.StringFormats

/**
 * Kotlin extraction definitions.
 *
 * Extraction:
 * - Identifiers: classes, functions, properties, parameters, type aliases, labels, etc.
 * - Comments: line (//) and multiline (/* */) comments
 * - Strings: string literals via string_content child
 *
 * Special handling:
 * - Underscore identifiers (_) are filtered out (represent unused values)
 * - Annotation classes parsed as infix_expression are handled via custom extractor
 * - Labels have @ suffix removed
 * - Lambda parameters and destructuring declarations use custom multi-extractors
 */
object KotlinExtractionMapping : ExtractionMapping {
    private const val SIMPLE_IDENTIFIER = "simple_identifier"
    private const val TYPE_IDENTIFIER = "type_identifier"
    private const val VARIABLE_DECLARATION = "variable_declaration"
    private const val MULTI_VARIABLE_DECLARATION = "multi_variable_declaration"

    override val nodeExtractions: Map<String, Extract> = buildMap {
        // Identifiers with generic extraction strategies
        put(
            "type_alias",
            Extract.Identifier(single = ExtractionStrategy.FirstChildByType(TYPE_IDENTIFIER))
        )
        put(
            "type_parameter",
            Extract.Identifier(single = ExtractionStrategy.FirstChildByType(TYPE_IDENTIFIER))
        )
        put(
            "function_declaration",
            Extract.Identifier(single = ExtractionStrategy.FirstChildByType(SIMPLE_IDENTIFIER))
        )
        put(
            "class_parameter",
            Extract.Identifier(single = ExtractionStrategy.FirstChildByType(SIMPLE_IDENTIFIER))
        )
        put(
            "parameter",
            Extract.Identifier(single = ExtractionStrategy.FirstChildByType(SIMPLE_IDENTIFIER))
        )
        put(
            "enum_entry",
            Extract.Identifier(single = ExtractionStrategy.FirstChildByType(SIMPLE_IDENTIFIER))
        )
        put(
            "parameter_with_optional_type",
            Extract.Identifier(single = ExtractionStrategy.FirstChildByType(SIMPLE_IDENTIFIER))
        )
        put(
            "catch_block",
            Extract.Identifier(single = ExtractionStrategy.FirstChildByType(SIMPLE_IDENTIFIER))
        )
        put(
            "class_declaration",
            Extract.Identifier(single = ExtractionStrategy.FirstChildByTypes(SIMPLE_IDENTIFIER, TYPE_IDENTIFIER))
        )
        put(
            "object_declaration",
            Extract.Identifier(single = ExtractionStrategy.FirstChildByTypes(SIMPLE_IDENTIFIER, TYPE_IDENTIFIER))
        )
        put(
            "interface_declaration",
            Extract.Identifier(single = ExtractionStrategy.FirstChildByTypes(SIMPLE_IDENTIFIER, TYPE_IDENTIFIER))
        )
        put(
            "when_subject",
            Extract.Identifier(single = ExtractionStrategy.NestedInChild(VARIABLE_DECLARATION, SIMPLE_IDENTIFIER))
        )

        // Identifiers with custom extraction (filtering underscores)
        put(
            "infix_expression",
            Extract.Identifier(customSingle = ::extractAnnotationClassFromInfixExpression)
        )
        put(
            "label",
            Extract.Identifier(customSingle = ::extractLabelIdentifier)
        )
        put(
            "property_declaration",
            Extract.Identifier(
                single = ExtractionStrategy.NestedInChild(VARIABLE_DECLARATION, SIMPLE_IDENTIFIER),
                customMulti = ::extractPropertyIdentifiers
            )
        )
        put(
            "lambda_parameters",
            Extract.Identifier(customMulti = ::extractLambdaParameterIdentifiers)
        )
        put(
            MULTI_VARIABLE_DECLARATION,
            Extract.Identifier(customMulti = ::extractLambdaParameterIdentifiers)
        )
        put(
            "for_statement",
            Extract.Identifier(customMulti = ::extractPropertyIdentifiers)
        )

        // Comments
        put("line_comment", Extract.Comment(CommentFormats.Line("//")))
        put("multiline_comment", Extract.Comment(CommentFormats.Block))

        // Strings
        put("string_literal", Extract.StringLiteral(format = StringFormats.FromChild("string_content")))
    }
}
