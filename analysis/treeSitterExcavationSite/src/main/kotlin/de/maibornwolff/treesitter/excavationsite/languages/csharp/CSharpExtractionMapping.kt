package de.maibornwolff.treesitter.excavationsite.languages.csharp

import de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors.extractAllTuplePatternVariables
import de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors.extractForLoopVariable
import de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors.extractForeachVariable
import de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors.extractLambdaSingleParameter
import de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors.extractParamsParametersInOrder
import de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors.extractUsingVariable
import de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors.extractVarPatternVariable
import de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors.findIdentifierInVariableDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors.findLastIdentifier
import de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors.findMethodName
import de.maibornwolff.treesitter.excavationsite.shared.domain.CommentFormats
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionStrategy
import de.maibornwolff.treesitter.excavationsite.shared.domain.StringFormats

/**
 * C# extraction definitions.
 */
object CSharpExtractionMapping : ExtractionMapping {
    private const val IDENTIFIER = "identifier"

    override val nodeExtractions: Map<String, Extract> = buildMap {
        // Identifiers - simple first child
        put("class_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("interface_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("struct_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("enum_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("record_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("delegate_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("constructor_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("property_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("enum_member_declaration", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put("type_parameter", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))

        // Identifiers - custom extractors
        put("method_declaration", Extract.Identifier(customSingle = ::findMethodName))
        put("local_function_statement", Extract.Identifier(customSingle = ::findMethodName))
        put("field_declaration", Extract.Identifier(customSingle = ::findIdentifierInVariableDeclaration))
        put(
            "local_declaration_statement",
            Extract.Identifier(customSingle = ::findIdentifierInVariableDeclaration)
        )
        put("event_field_declaration", Extract.Identifier(customSingle = ::findIdentifierInVariableDeclaration))
        put("parameter", Extract.Identifier(customSingle = ::findLastIdentifier))
        put("catch_declaration", Extract.Identifier(customSingle = ::findLastIdentifier))
        put("declaration_pattern", Extract.Identifier(customSingle = ::findLastIdentifier))
        put("lambda_expression", Extract.Identifier(customSingle = ::extractLambdaSingleParameter))
        put("foreach_statement", Extract.Identifier(customSingle = ::extractForeachVariable))
        put("using_statement", Extract.Identifier(customSingle = ::extractUsingVariable))
        put("for_statement", Extract.Identifier(customSingle = ::extractForLoopVariable))
        put("var_pattern", Extract.Identifier(customSingle = ::extractVarPatternVariable))

        // Identifiers - multiple extraction
        put("parameter_list", Extract.Identifier(customMulti = ::extractParamsParametersInOrder))
        put("tuple_pattern", Extract.Identifier(customMulti = ::extractAllTuplePatternVariables))

        // Comments
        put("comment", Extract.Comment(CommentFormats.AutoDetect))

        // Strings
        put("string_literal", Extract.StringLiteral(format = StringFormats.Quoted()))
        put("verbatim_string_literal", Extract.StringLiteral(format = StringFormats.CSharpVerbatim))
        put("interpolated_string_expression", Extract.StringLiteral(format = StringFormats.CSharpInterpolated))
        put("raw_string_literal", Extract.StringLiteral(format = StringFormats.CSharpRaw))
    }
}
