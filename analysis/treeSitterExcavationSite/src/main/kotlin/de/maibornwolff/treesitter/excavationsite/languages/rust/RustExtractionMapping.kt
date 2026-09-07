package de.maibornwolff.treesitter.excavationsite.languages.rust

import de.maibornwolff.treesitter.excavationsite.languages.rust.extractors.extractLetBindingIdentifiers
import de.maibornwolff.treesitter.excavationsite.languages.rust.extractors.extractRustBlockComment
import de.maibornwolff.treesitter.excavationsite.languages.rust.extractors.extractRustLineComment
import de.maibornwolff.treesitter.excavationsite.languages.rust.extractors.extractRustStringLiteralContent
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionStrategy
import de.maibornwolff.treesitter.excavationsite.shared.domain.StringFormats

/**
 * Rust extraction definitions.
 *
 * Covers identifier-bearing declarations, comments (line/doc and block), and string
 * literals (normal, raw, byte, char). `impl_item` is intentionally not mapped: it
 * declares no new name — its target type is already extracted from the type's own
 * declaration.
 */
object RustExtractionMapping : ExtractionMapping {
    private const val IDENTIFIER = "identifier"
    private const val TYPE_IDENTIFIER = "type_identifier"
    private const val FIELD_IDENTIFIER = "field_identifier"

    override val nodeExtractions: Map<String, Extract> = buildMap {
        // Identifiers - type-defining declarations and generic type parameters (type_identifier)
        listOf("struct_item", "enum_item", "union_item", "trait_item", "type_item", "type_parameter")
            .forEach { put(it, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(TYPE_IDENTIFIER))) }

        // Identifiers - value, module, function, and const-generic declarations (identifier)
        listOf(
            "function_item",
            "function_signature_item",
            "mod_item",
            "const_item",
            "static_item",
            "macro_definition",
            "enum_variant",
            "parameter",
            "const_parameter"
        ).forEach { put(it, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER))) }

        // Identifiers - struct/union fields (field_identifier)
        put("field_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(FIELD_IDENTIFIER)))

        // Identifiers - untyped closure parameters (bare identifier direct children;
        // typed params are their own `parameter` nodes, extracted above)
        put("closure_parameters", Extract.Identifier(multi = ExtractionStrategy.AllChildrenByType(IDENTIFIER)))

        // Identifiers - custom extractor for let bindings (simple, mut, tuple, struct, tuple-struct patterns)
        put("let_declaration", Extract.Identifier(customMulti = ::extractLetBindingIdentifiers))

        // Comments (custom extractors strip the //! and /*! inner-doc markers)
        put("line_comment", Extract.Comment(custom = ::extractRustLineComment)) // //, ///, //!
        put("block_comment", Extract.Comment(custom = ::extractRustBlockComment)) // /* */, /** */, /*! */

        // Strings
        put("string_literal", Extract.StringLiteral(custom = ::extractRustStringLiteralContent))
        put("raw_string_literal", Extract.StringLiteral(format = StringFormats.FromChild("string_content")))
        put("char_literal", Extract.StringLiteral(format = StringFormats.Quoted(stripSingleQuotes = true)))
    }
}
