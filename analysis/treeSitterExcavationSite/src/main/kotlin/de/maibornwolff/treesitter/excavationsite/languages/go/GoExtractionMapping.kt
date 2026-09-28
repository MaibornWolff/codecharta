package de.maibornwolff.treesitter.excavationsite.languages.go

import de.maibornwolff.treesitter.excavationsite.languages.go.extractors.extractAllFieldDeclarationIdentifiers
import de.maibornwolff.treesitter.excavationsite.languages.go.extractors.extractAllFromConstDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.go.extractors.extractAllFromExpressionList
import de.maibornwolff.treesitter.excavationsite.languages.go.extractors.extractAllFromVarDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.go.extractors.extractFieldDeclarationIdentifier
import de.maibornwolff.treesitter.excavationsite.languages.go.extractors.extractFromConstDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.go.extractors.extractFromExpressionList
import de.maibornwolff.treesitter.excavationsite.languages.go.extractors.extractFromVarDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.go.extractors.extractIdentifiersFromExpressionListChild
import de.maibornwolff.treesitter.excavationsite.languages.go.extractors.extractNonImportInterpretedString
import de.maibornwolff.treesitter.excavationsite.languages.go.extractors.extractNonImportRawString
import de.maibornwolff.treesitter.excavationsite.languages.go.extractors.extractTypeDeclarationIdentifier
import de.maibornwolff.treesitter.excavationsite.shared.domain.CommentFormats
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionStrategy
import de.maibornwolff.treesitter.excavationsite.shared.domain.StringFormats

/**
 * Go extraction definitions.
 */
object GoExtractionMapping : ExtractionMapping {
    private const val IDENTIFIER = "identifier"
    private const val FIELD_IDENTIFIER = "field_identifier"

    override val nodeExtractions: Map<String, Extract> = buildMap {
        // Identifiers - simple first child
        put("function_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put(
            "parameter_declaration",
            Extract.Identifier(
                single = ExtractionStrategy.FirstChildByType(IDENTIFIER),
                multi = ExtractionStrategy.AllChildrenByType(IDENTIFIER)
            )
        )
        put(
            "type_parameter_declaration",
            Extract.Identifier(
                single = ExtractionStrategy.FirstChildByType(IDENTIFIER),
                multi = ExtractionStrategy.AllChildrenByType(IDENTIFIER)
            )
        )
        put("method_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(FIELD_IDENTIFIER)))
        put("method_elem", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(FIELD_IDENTIFIER)))

        // Identifiers - custom extractors
        put("type_declaration", Extract.Identifier(customSingle = ::extractTypeDeclarationIdentifier))
        put(
            "var_declaration",
            Extract.Identifier(
                customSingle = ::extractFromVarDeclaration,
                customMulti = ::extractAllFromVarDeclaration
            )
        )
        put(
            "const_declaration",
            Extract.Identifier(
                customSingle = ::extractFromConstDeclaration,
                customMulti = ::extractAllFromConstDeclaration
            )
        )
        put(
            "short_var_declaration",
            Extract.Identifier(
                customSingle = ::extractFromExpressionList,
                customMulti = ::extractAllFromExpressionList
            )
        )
        put(
            "field_declaration",
            Extract.Identifier(
                customSingle = ::extractFieldDeclarationIdentifier,
                customMulti = ::extractAllFieldDeclarationIdentifiers
            )
        )
        put("receive_statement", Extract.Identifier(customMulti = ::extractAllFromExpressionList))
        put("range_clause", Extract.Identifier(customMulti = ::extractIdentifiersFromExpressionListChild))
        put("type_switch_statement", Extract.Identifier(customMulti = ::extractIdentifiersFromExpressionListChild))

        // Comments
        put("comment", Extract.Comment(CommentFormats.AutoDetect))

        // Strings (skip import paths)
        put("raw_string_literal", Extract.StringLiteral(custom = ::extractNonImportRawString))
        put("interpreted_string_literal", Extract.StringLiteral(custom = ::extractNonImportInterpretedString))
        put("rune_literal", Extract.StringLiteral(format = StringFormats.Quoted(stripSingleQuotes = true)))
    }
}
