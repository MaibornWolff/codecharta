package de.maibornwolff.treesitter.excavationsite.languages.php

import de.maibornwolff.treesitter.excavationsite.languages.php.extractors.collectVariables
import de.maibornwolff.treesitter.excavationsite.languages.php.extractors.extractAssignmentTargetName
import de.maibornwolff.treesitter.excavationsite.languages.php.extractors.extractAttributeName
import de.maibornwolff.treesitter.excavationsite.languages.php.extractors.extractConstName
import de.maibornwolff.treesitter.excavationsite.languages.php.extractors.extractForeachValueVariable
import de.maibornwolff.treesitter.excavationsite.languages.php.extractors.extractGlobalVariables
import de.maibornwolff.treesitter.excavationsite.languages.php.extractors.extractNonImportEncapsedString
import de.maibornwolff.treesitter.excavationsite.languages.php.extractors.extractNonImportString
import de.maibornwolff.treesitter.excavationsite.languages.php.extractors.extractPropertyName
import de.maibornwolff.treesitter.excavationsite.languages.php.extractors.extractUseClauseName
import de.maibornwolff.treesitter.excavationsite.languages.php.extractors.findFirstVariableName
import de.maibornwolff.treesitter.excavationsite.languages.php.extractors.findNameAfterAs
import de.maibornwolff.treesitter.excavationsite.shared.domain.CommentFormats
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionStrategy
import de.maibornwolff.treesitter.excavationsite.shared.domain.StringFormats

/**
 * PHP extraction definitions.
 */
object PhpExtractionMapping : ExtractionMapping {
    private const val NAME = "name"
    private const val NAMESPACE_NAME = "namespace_name"
    private const val PAIR = "pair"

    override val nodeExtractions: Map<String, Extract> = buildMap {
        // Identifiers - simple first child
        put("class_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(NAME)))
        put("interface_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(NAME)))
        put("trait_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(NAME)))
        put("enum_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(NAME)))
        put("function_definition", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(NAME)))
        put("method_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(NAME)))
        put("namespace_definition", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(NAMESPACE_NAME)))

        // Identifiers - custom single extractors
        put("property_declaration", Extract.Identifier(customSingle = ::extractPropertyName))
        put("const_declaration", Extract.Identifier(customSingle = ::extractConstName))
        put("simple_parameter", Extract.Identifier(customSingle = ::findFirstVariableName))
        put("property_promotion_parameter", Extract.Identifier(customSingle = ::findFirstVariableName))
        put("static_variable_declaration", Extract.Identifier(customSingle = ::findFirstVariableName))
        put("catch_clause", Extract.Identifier(customSingle = ::findFirstVariableName))
        put("assignment_expression", Extract.Identifier(customSingle = ::extractAssignmentTargetName))
        put("foreach_statement", Extract.Identifier(customSingle = ::extractForeachValueVariable))
        put("namespace_use_clause", Extract.Identifier(customSingle = ::extractUseClauseName))
        put("attribute", Extract.Identifier(customSingle = ::extractAttributeName))
        put("use_as_clause", Extract.Identifier(customSingle = ::findNameAfterAs))

        // Identifiers - custom multi extractors
        put(PAIR, Extract.Identifier(customMulti = ::collectVariables))
        put("anonymous_function_use_clause", Extract.Identifier(customMulti = ::collectVariables))
        put("list_literal", Extract.Identifier(customMulti = ::collectVariables))
        put("global_declaration", Extract.Identifier(customMulti = ::extractGlobalVariables))

        // Comments
        put("comment", Extract.Comment(CommentFormats.AutoDetect))

        // Strings (skip include/require paths)
        put("string", Extract.StringLiteral(custom = ::extractNonImportString))
        put("encapsed_string", Extract.StringLiteral(custom = ::extractNonImportEncapsedString))

        // Strings - heredoc/nowdoc
        put("heredoc", Extract.StringLiteral(format = StringFormats.PhpHeredoc))
        put("nowdoc", Extract.StringLiteral(format = StringFormats.PhpHeredoc))
    }
}
