package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.extractFromCatchClause
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.extractFromDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.extractFromFieldDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.extractFromForRangeLoop
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.extractFromFriendDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.extractFromFunctionDefinition
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.extractFromLambdaCaptures
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.extractFromNamespaceDefinition
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.extractFromParameterDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.extractFromStructuredBinding
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.extractFromTypeParameter
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.extractFromUsingDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.CommentFormats
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionStrategy
import de.maibornwolff.treesitter.excavationsite.shared.domain.StringFormats

/**
 * C++ extraction definitions.
 */
object CppExtractionMapping : ExtractionMapping {
    private const val IDENTIFIER = "identifier"
    private const val TYPE_IDENTIFIER = "type_identifier"
    private const val STRUCTURED_BINDING_DECLARATOR = "structured_binding_declarator"

    override val nodeExtractions: Map<String, Extract> = buildMap {
        // Identifiers - simple first child
        put("class_specifier", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(TYPE_IDENTIFIER)))
        put("struct_specifier", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(TYPE_IDENTIFIER)))
        put("enum_specifier", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(TYPE_IDENTIFIER)))
        put("alias_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(TYPE_IDENTIFIER)))
        put("enumerator", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("concept_definition", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))

        // Identifiers - custom extractors
        put("function_definition", Extract.Identifier(customSingle = ::extractFromFunctionDefinition))
        put("namespace_definition", Extract.Identifier(customSingle = ::extractFromNamespaceDefinition))
        put("declaration", Extract.Identifier(customSingle = ::extractFromDeclaration))
        put("field_declaration", Extract.Identifier(customSingle = ::extractFromFieldDeclaration))
        put("parameter_declaration", Extract.Identifier(customSingle = ::extractFromParameterDeclaration))
        put("type_parameter_declaration", Extract.Identifier(customSingle = ::extractFromTypeParameter))
        put("optional_type_parameter_declaration", Extract.Identifier(customSingle = ::extractFromTypeParameter))
        put("for_range_loop", Extract.Identifier(customSingle = ::extractFromForRangeLoop))
        put("catch_clause", Extract.Identifier(customSingle = ::extractFromCatchClause))
        put("using_declaration", Extract.Identifier(customSingle = ::extractFromUsingDeclaration))
        put("friend_declaration", Extract.Identifier(customSingle = ::extractFromFriendDeclaration))

        // Identifiers - multi extractors
        put(STRUCTURED_BINDING_DECLARATOR, Extract.Identifier(customMulti = ::extractFromStructuredBinding))
        put("lambda_capture_specifier", Extract.Identifier(customMulti = ::extractFromLambdaCaptures))

        // Comments
        put("comment", Extract.Comment(CommentFormats.AutoDetect))

        // Strings
        put("string_literal", Extract.StringLiteral(format = StringFormats.Quoted()))
        put("raw_string_literal", Extract.StringLiteral(format = StringFormats.CppRaw))
        put("char_literal", Extract.StringLiteral(format = StringFormats.Quoted(stripSingleQuotes = true)))
    }
}
