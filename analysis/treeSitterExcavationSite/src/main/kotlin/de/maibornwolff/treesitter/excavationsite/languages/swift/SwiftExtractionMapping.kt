package de.maibornwolff.treesitter.excavationsite.languages.swift

import de.maibornwolff.treesitter.excavationsite.languages.swift.extractors.extractAllBoundVariables
import de.maibornwolff.treesitter.excavationsite.languages.swift.extractors.extractClassOrExtensionIdentifier
import de.maibornwolff.treesitter.excavationsite.languages.swift.extractors.extractDeinitKeyword
import de.maibornwolff.treesitter.excavationsite.languages.swift.extractors.extractFromPattern
import de.maibornwolff.treesitter.excavationsite.languages.swift.extractors.extractInitKeyword
import de.maibornwolff.treesitter.excavationsite.languages.swift.extractors.extractParameterName
import de.maibornwolff.treesitter.excavationsite.languages.swift.extractors.extractSubscriptKeyword
import de.maibornwolff.treesitter.excavationsite.shared.domain.CommentFormats
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionStrategy
import de.maibornwolff.treesitter.excavationsite.shared.domain.StringFormats

/**
 * Swift extraction definitions.
 */
object SwiftExtractionMapping : ExtractionMapping {
    private const val SIMPLE_IDENTIFIER = "simple_identifier"
    private const val TYPE_IDENTIFIER = "type_identifier"
    private const val CLASS_DECLARATION = "class_declaration"
    private const val STRUCT_DECLARATION = "struct_declaration"
    private const val PROTOCOL_DECLARATION = "protocol_declaration"
    private const val FUNCTION_DECLARATION = "function_declaration"
    private const val PROTOCOL_FUNCTION_DECLARATION = "protocol_function_declaration"
    private const val INIT_DECLARATION = "init_declaration"
    private const val DEINIT_DECLARATION = "deinit_declaration"
    private const val SUBSCRIPT_DECLARATION = "subscript_declaration"
    private const val PROPERTY_DECLARATION = "property_declaration"
    private const val PROTOCOL_PROPERTY_DECLARATION = "protocol_property_declaration"
    private const val TYPEALIAS_DECLARATION = "typealias_declaration"
    private const val ASSOCIATEDTYPE_DECLARATION = "associatedtype_declaration"
    private const val PARAMETER = "parameter"
    private const val LAMBDA_PARAMETER = "lambda_parameter"
    private const val TYPE_PARAMETER = "type_parameter"
    private const val ENUM_ENTRY = "enum_entry"
    private const val ENUM_TYPE_PARAMETERS = "enum_type_parameters"
    private const val GUARD_STATEMENT = "guard_statement"
    private const val IF_STATEMENT = "if_statement"
    private const val COMMENT = "comment"
    private const val MULTILINE_COMMENT = "multiline_comment"
    private const val LINE_STRING_LITERAL = "line_string_literal"
    private const val MULTI_LINE_STRING_LITERAL = "multi_line_string_literal"
    private const val REGEX_LITERAL = "regex_literal"

    override val nodeExtractions: Map<String, Extract> = buildMap {
        // Identifiers - simple first child strategies
        put(STRUCT_DECLARATION, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(TYPE_IDENTIFIER)))
        put(PROTOCOL_DECLARATION, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(TYPE_IDENTIFIER)))
        put(TYPEALIAS_DECLARATION, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(TYPE_IDENTIFIER)))
        put(ASSOCIATEDTYPE_DECLARATION, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(TYPE_IDENTIFIER)))
        put(TYPE_PARAMETER, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(TYPE_IDENTIFIER)))
        put(FUNCTION_DECLARATION, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(SIMPLE_IDENTIFIER)))
        put(PROTOCOL_FUNCTION_DECLARATION, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(SIMPLE_IDENTIFIER)))
        put(ENUM_ENTRY, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(SIMPLE_IDENTIFIER)))
        put(ENUM_TYPE_PARAMETERS, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(SIMPLE_IDENTIFIER)))

        // Identifiers - custom extractors
        put(CLASS_DECLARATION, Extract.Identifier(customSingle = ::extractClassOrExtensionIdentifier))
        put(INIT_DECLARATION, Extract.Identifier(customSingle = ::extractInitKeyword))
        put(DEINIT_DECLARATION, Extract.Identifier(customSingle = ::extractDeinitKeyword))
        put(SUBSCRIPT_DECLARATION, Extract.Identifier(customSingle = ::extractSubscriptKeyword))
        put(PROPERTY_DECLARATION, Extract.Identifier(customSingle = ::extractFromPattern))
        put(PROTOCOL_PROPERTY_DECLARATION, Extract.Identifier(customSingle = ::extractFromPattern))
        put(PARAMETER, Extract.Identifier(customSingle = ::extractParameterName))
        put(LAMBDA_PARAMETER, Extract.Identifier(customSingle = ::extractParameterName))
        put(GUARD_STATEMENT, Extract.Identifier(customMulti = ::extractAllBoundVariables))
        put(IF_STATEMENT, Extract.Identifier(customMulti = ::extractAllBoundVariables))

        // Comments
        put(COMMENT, Extract.Comment(CommentFormats.AutoDetect))
        put(MULTILINE_COMMENT, Extract.Comment(CommentFormats.Block))

        // Strings
        put(LINE_STRING_LITERAL, Extract.StringLiteral(format = StringFormats.Quoted()))
        put(MULTI_LINE_STRING_LITERAL, Extract.StringLiteral(format = StringFormats.TripleQuoted))
        put(REGEX_LITERAL, Extract.StringLiteral(format = StringFormats.Regex))
    }
}
