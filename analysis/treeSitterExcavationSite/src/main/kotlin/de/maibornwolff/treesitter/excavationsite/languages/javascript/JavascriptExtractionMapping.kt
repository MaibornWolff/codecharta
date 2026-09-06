package de.maibornwolff.treesitter.excavationsite.languages.javascript

import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.extractArrowFunctionSingleParameter
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.extractFirstBindingIdentifiers
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.extractIdentifiersFromClassDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.extractIdentifiersFromEnumDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.extractIdentifiersFromFormalParameters
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.extractIdentifiersFromMethodDefinition
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.extractIdentifiersFromVariableDeclarator
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.extractNonImportString
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.extractNonImportTemplateString
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.extractPropertyName
import de.maibornwolff.treesitter.excavationsite.shared.domain.CommentFormats
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionStrategy

/**
 * JavaScript extraction definitions.
 *
 * Note: This mapping is also used by TypeScript as they share AST structure.
 */
object JavascriptExtractionMapping : ExtractionMapping {
    override val nodeExtractions: Map<String, Extract> = buildMap {
        // Identifiers with generic extraction strategies
        put(
            "function_declaration",
            Extract.Identifier(single = ExtractionStrategy.FirstChildByTypes(IDENTIFIER, TYPE_IDENTIFIER))
        )
        put(
            "generator_function_declaration",
            Extract.Identifier(single = ExtractionStrategy.FirstChildByTypes(IDENTIFIER, TYPE_IDENTIFIER))
        )
        put(
            "interface_declaration",
            Extract.Identifier(single = ExtractionStrategy.FirstChildByTypes(IDENTIFIER, TYPE_IDENTIFIER))
        )
        put(
            "type_alias_declaration",
            Extract.Identifier(single = ExtractionStrategy.FirstChildByTypes(IDENTIFIER, TYPE_IDENTIFIER))
        )
        put(
            "internal_module",
            Extract.Identifier(single = ExtractionStrategy.FirstChildByTypes(IDENTIFIER, TYPE_IDENTIFIER))
        )
        put(
            "function_expression",
            Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER))
        )
        put(
            "arrow_function",
            Extract.Identifier(customSingle = ::extractArrowFunctionSingleParameter)
        )
        put(
            "required_parameter",
            Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER))
        )
        put(
            "optional_parameter",
            Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER))
        )
        put(
            "type_parameter",
            Extract.Identifier(single = ExtractionStrategy.FirstChildByTypes(TYPE_IDENTIFIER, IDENTIFIER))
        )

        // Identifiers with custom extraction (property names)
        put("field_definition", Extract.Identifier(customSingle = ::extractPropertyName))
        put("public_field_definition", Extract.Identifier(customSingle = ::extractPropertyName))
        put("property_signature", Extract.Identifier(customSingle = ::extractPropertyName))

        // Identifiers with custom multi-extraction
        put(
            "variable_declarator",
            Extract.Identifier(customMulti = ::extractIdentifiersFromVariableDeclarator)
        )
        put("formal_parameters", Extract.Identifier(customMulti = ::extractIdentifiersFromFormalParameters))
        put("class_declaration", Extract.Identifier(customMulti = ::extractIdentifiersFromClassDeclaration))
        put("class", Extract.Identifier(customMulti = ::extractIdentifiersFromClassDeclaration))
        put("method_definition", Extract.Identifier(customMulti = ::extractIdentifiersFromMethodDefinition))
        put("for_in_statement", Extract.Identifier(customMulti = ::extractFirstBindingIdentifiers))
        put("catch_clause", Extract.Identifier(customMulti = ::extractFirstBindingIdentifiers))
        put("enum_declaration", Extract.Identifier(customMulti = ::extractIdentifiersFromEnumDeclaration))

        // Comments (auto-detect format)
        put("comment", Extract.Comment(CommentFormats.AutoDetect))
        put("html_comment", Extract.Comment(CommentFormats.AutoDetect))

        // Strings (skip import paths)
        put("string", Extract.StringLiteral(custom = ::extractNonImportString))
        put("template_string", Extract.StringLiteral(custom = ::extractNonImportTemplateString))
    }
}
