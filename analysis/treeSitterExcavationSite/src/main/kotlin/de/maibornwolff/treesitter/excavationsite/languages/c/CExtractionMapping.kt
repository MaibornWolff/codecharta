package de.maibornwolff.treesitter.excavationsite.languages.c

import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.extractAllDeclarators
import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.extractFromDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.extractFromFieldDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.extractFromFunctionDefinition
import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.extractFromInitializerPair
import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.extractFromParameterDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.c.extractors.extractFromTypedef
import de.maibornwolff.treesitter.excavationsite.shared.domain.CommentFormats
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionStrategy
import de.maibornwolff.treesitter.excavationsite.shared.domain.StringFormats

/**
 * C extraction definitions.
 */
object CExtractionMapping : ExtractionMapping {
    private const val IDENTIFIER = "identifier"
    private const val TYPE_IDENTIFIER = "type_identifier"
    private const val STATEMENT_IDENTIFIER = "statement_identifier"

    override val nodeExtractions: Map<String, Extract> = buildMap {
        // Identifiers - simple first child
        put("struct_specifier", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(TYPE_IDENTIFIER)))
        put("enum_specifier", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(TYPE_IDENTIFIER)))
        put("union_specifier", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(TYPE_IDENTIFIER)))
        put("enumerator", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("preproc_def", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("preproc_function_def", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("preproc_ifdef", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("preproc_ifndef", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("labeled_statement", Extract.Identifier(single = ExtractionStrategy.FirstChildByTypes(STATEMENT_IDENTIFIER, IDENTIFIER)))

        // Identifiers - custom extractors for complex declarator syntax
        put("function_definition", Extract.Identifier(customSingle = ::extractFromFunctionDefinition))
        put(
            "declaration",
            Extract.Identifier(
                customSingle = ::extractFromDeclaration,
                customMulti = ::extractAllDeclarators
            )
        )
        put("parameter_declaration", Extract.Identifier(customSingle = ::extractFromParameterDeclaration))
        put("field_declaration", Extract.Identifier(customSingle = ::extractFromFieldDeclaration))
        put("type_definition", Extract.Identifier(customSingle = ::extractFromTypedef))
        put("initializer_pair", Extract.Identifier(customSingle = ::extractFromInitializerPair))

        // Comments
        put("comment", Extract.Comment(CommentFormats.AutoDetect))

        // Strings
        put("string_literal", Extract.StringLiteral(format = StringFormats.Quoted()))
        put("char_literal", Extract.StringLiteral(format = StringFormats.Quoted(stripSingleQuotes = true)))
    }
}
