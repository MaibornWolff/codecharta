package de.maibornwolff.treesitter.excavationsite.languages.vba

import de.maibornwolff.treesitter.excavationsite.languages.vba.extractors.declaredName
import de.maibornwolff.treesitter.excavationsite.languages.vba.extractors.extractVbaComment
import de.maibornwolff.treesitter.excavationsite.languages.vba.extractors.extractVbaString
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionMapping

object VbaExtractionMapping : ExtractionMapping {
    override val nodeExtractions: Map<String, Extract> = buildMap {
        listOf(
            "sub_declaration",
            "function_declaration",
            "property_get_declaration",
            "property_let_declaration",
            "property_set_declaration",
            "conditional_sub_declaration",
            "conditional_function_declaration",
            "conditional_property_declaration",
            "declare_sub_statement",
            "declare_function_statement",
            "event_declaration",
            "parameter",
            "variable_declarator",
            "const_declarator",
            "type_declaration",
            "type_member",
            "enum_declaration",
            "enum_member"
        ).forEach { put(it, Extract.Identifier(customSingle = ::declaredName)) }

        put("comment", Extract.Comment(custom = ::extractVbaComment))
        put("string_literal", Extract.StringLiteral(custom = ::extractVbaString))
    }
}
