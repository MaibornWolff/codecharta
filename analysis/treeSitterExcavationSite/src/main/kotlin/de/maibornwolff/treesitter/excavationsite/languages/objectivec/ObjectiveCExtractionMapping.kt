package de.maibornwolff.treesitter.excavationsite.languages.objectivec

import de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors.extractAllBlockParameters
import de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors.extractAllForwardClasses
import de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors.extractCStringLiteral
import de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors.extractCategoryIdentifier
import de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors.extractClassIdentifier
import de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors.extractFromCatchClause
import de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors.extractFromClassForwardDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors.extractFromDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors.extractFromFieldDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors.extractFromForInStatement
import de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors.extractFromFunctionDefinition
import de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors.extractFromParameterDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors.extractFromPreprocessorDef
import de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors.extractFromPreprocessorFunctionDef
import de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors.extractFromProtocolForwardDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors.extractFromSynthesizeOrDynamic
import de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors.extractKeywordDeclaratorParameter
import de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors.extractMethodSelector
import de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors.extractObjCStringExpression
import de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors.extractPropertyIdentifier
import de.maibornwolff.treesitter.excavationsite.languages.objectivec.extractors.extractProtocolIdentifier
import de.maibornwolff.treesitter.excavationsite.shared.domain.CommentFormats
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionMapping

/**
 * Objective-C extraction definitions.
 */
object ObjectiveCExtractionMapping : ExtractionMapping {
    private const val CLASS_INTERFACE = "class_interface"
    private const val CLASS_IMPLEMENTATION = "class_implementation"
    private const val CATEGORY_INTERFACE = "category_interface"
    private const val CATEGORY_IMPLEMENTATION = "category_implementation"
    private const val PROTOCOL_DECLARATION = "protocol_declaration"
    private const val METHOD_DEFINITION = "method_definition"
    private const val METHOD_DECLARATION = "method_declaration"
    private const val FUNCTION_DEFINITION = "function_definition"
    private const val KEYWORD_DECLARATOR = "keyword_declarator"
    private const val DECLARATION = "declaration"
    private const val PROPERTY_DECLARATION = "property_declaration"
    private const val PARAMETER_DECLARATION = "parameter_declaration"
    private const val FIELD_DECLARATION = "field_declaration"
    private const val FOR_IN_STATEMENT = "for_in_statement"
    private const val CATCH_CLAUSE = "@catch"
    private const val BLOCK_PARAMETERS = "block_parameters"
    private const val SYNTHESIZE_DEFINITION = "synthesize_definition"
    private const val DYNAMIC_DEFINITION = "dynamic_definition"
    private const val CLASS_FORWARD_DECLARATION = "class_forward_declaration"
    private const val PROTOCOL_FORWARD_DECLARATION = "protocol_forward_declaration"
    private const val PREPROC_DEF = "preproc_def"
    private const val PREPROC_FUNCTION_DEF = "preproc_function_def"
    private const val STRING_LITERAL = "string_literal"
    private const val STRING_EXPRESSION = "string_expression"

    override val nodeExtractions: Map<String, Extract> = buildMap {
        // Identifiers - with custom extractors
        put(CLASS_INTERFACE, Extract.Identifier(customSingle = ::extractClassIdentifier))
        put(CLASS_IMPLEMENTATION, Extract.Identifier(customSingle = ::extractClassIdentifier))
        put(CATEGORY_INTERFACE, Extract.Identifier(customSingle = ::extractCategoryIdentifier))
        put(CATEGORY_IMPLEMENTATION, Extract.Identifier(customSingle = ::extractCategoryIdentifier))
        put(PROTOCOL_DECLARATION, Extract.Identifier(customSingle = ::extractProtocolIdentifier))
        put(METHOD_DEFINITION, Extract.Identifier(customSingle = ::extractMethodSelector))
        put(METHOD_DECLARATION, Extract.Identifier(customSingle = ::extractMethodSelector))
        put(FUNCTION_DEFINITION, Extract.Identifier(customSingle = ::extractFromFunctionDefinition))
        put(DECLARATION, Extract.Identifier(customSingle = ::extractFromDeclaration))
        put(PROPERTY_DECLARATION, Extract.Identifier(customSingle = ::extractPropertyIdentifier))
        put(KEYWORD_DECLARATOR, Extract.Identifier(customSingle = ::extractKeywordDeclaratorParameter))
        put(PARAMETER_DECLARATION, Extract.Identifier(customSingle = ::extractFromParameterDeclaration))
        put(FIELD_DECLARATION, Extract.Identifier(customSingle = ::extractFromFieldDeclaration))
        put(FOR_IN_STATEMENT, Extract.Identifier(customSingle = ::extractFromForInStatement))
        put(CATCH_CLAUSE, Extract.Identifier(customSingle = ::extractFromCatchClause))
        put(SYNTHESIZE_DEFINITION, Extract.Identifier(customSingle = ::extractFromSynthesizeOrDynamic))
        put(DYNAMIC_DEFINITION, Extract.Identifier(customSingle = ::extractFromSynthesizeOrDynamic))
        put(
            CLASS_FORWARD_DECLARATION,
            Extract.Identifier(
                customSingle = ::extractFromClassForwardDeclaration,
                customMulti = ::extractAllForwardClasses
            )
        )
        put(
            PROTOCOL_FORWARD_DECLARATION,
            Extract.Identifier(customSingle = ::extractFromProtocolForwardDeclaration)
        )
        put(PREPROC_DEF, Extract.Identifier(customSingle = ::extractFromPreprocessorDef))
        put(PREPROC_FUNCTION_DEF, Extract.Identifier(customSingle = ::extractFromPreprocessorFunctionDef))
        put(BLOCK_PARAMETERS, Extract.Identifier(customMulti = ::extractAllBlockParameters))

        // Comments
        put("comment", Extract.Comment(CommentFormats.AutoDetect))

        // Strings - with custom extractors
        put(STRING_LITERAL, Extract.StringLiteral(custom = ::extractCStringLiteral))
        put(STRING_EXPRESSION, Extract.StringLiteral(custom = ::extractObjCStringExpression))
    }
}
