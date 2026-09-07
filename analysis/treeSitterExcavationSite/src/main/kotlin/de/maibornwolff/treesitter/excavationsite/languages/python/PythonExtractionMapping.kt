package de.maibornwolff.treesitter.excavationsite.languages.python

import de.maibornwolff.treesitter.excavationsite.languages.python.extractors.extractAllIdentifiers
import de.maibornwolff.treesitter.excavationsite.languages.python.extractors.extractDecoratorName
import de.maibornwolff.treesitter.excavationsite.languages.python.extractors.extractDocstring
import de.maibornwolff.treesitter.excavationsite.languages.python.extractors.extractFromAsPattern
import de.maibornwolff.treesitter.excavationsite.languages.python.extractors.extractFromAssignment
import de.maibornwolff.treesitter.excavationsite.languages.python.extractors.extractFromExceptClause
import de.maibornwolff.treesitter.excavationsite.languages.python.extractors.extractFromParameterIdentifier
import de.maibornwolff.treesitter.excavationsite.languages.python.extractors.extractFromTypeAlias
import de.maibornwolff.treesitter.excavationsite.languages.python.extractors.extractLoopVariables
import de.maibornwolff.treesitter.excavationsite.languages.python.extractors.extractPatternCaptureVariables
import de.maibornwolff.treesitter.excavationsite.languages.python.extractors.extractString
import de.maibornwolff.treesitter.excavationsite.languages.python.extractors.findFirstIdentifier
import de.maibornwolff.treesitter.excavationsite.languages.python.extractors.findLastIdentifier
import de.maibornwolff.treesitter.excavationsite.shared.domain.CommentFormats
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionStrategy

/**
 * Python extraction definitions.
 */
object PythonExtractionMapping : ExtractionMapping {
    private const val IDENTIFIER = "identifier"
    private const val CLASS_DEFINITION = "class_definition"
    private const val FUNCTION_DEFINITION = "function_definition"
    private const val ASSIGNMENT = "assignment"
    private const val TYPED_PARAMETER = "typed_parameter"
    private const val DEFAULT_PARAMETER = "default_parameter"
    private const val LIST_SPLAT_PATTERN = "list_splat_pattern"
    private const val DICTIONARY_SPLAT_PATTERN = "dictionary_splat_pattern"
    private const val FOR_IN_CLAUSE = "for_in_clause"
    private const val FOR_STATEMENT = "for_statement"
    private const val NAMED_EXPRESSION = "named_expression"
    private const val EXCEPT_CLAUSE = "except_clause"
    private const val AS_PATTERN = "as_pattern"
    private const val DECORATOR = "decorator"
    private const val TYPE_ALIAS_STATEMENT = "type_alias_statement"
    private const val GLOBAL_STATEMENT = "global_statement"
    private const val NONLOCAL_STATEMENT = "nonlocal_statement"
    private const val CASE_CLAUSE = "case_clause"
    private const val COMMENT = "comment"
    private const val EXPRESSION_STATEMENT = "expression_statement"
    private const val STRING = "string"

    override val nodeExtractions: Map<String, Extract> = buildMap {
        // Identifiers - generic extraction strategies
        put(CLASS_DEFINITION, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put(FUNCTION_DEFINITION, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put(TYPED_PARAMETER, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put(DEFAULT_PARAMETER, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put(LIST_SPLAT_PATTERN, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put(DICTIONARY_SPLAT_PATTERN, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put(NAMED_EXPRESSION, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))

        // Identifiers - custom extractors for context-dependent patterns
        put(ASSIGNMENT, Extract.Identifier(customSingle = ::extractFromAssignment))
        put(IDENTIFIER, Extract.Identifier(customSingle = ::extractFromParameterIdentifier))
        put(EXCEPT_CLAUSE, Extract.Identifier(customSingle = ::extractFromExceptClause))
        put(
            TYPE_ALIAS_STATEMENT,
            Extract.Identifier(customSingle = {
                n,
                s
                ->
                extractFromTypeAlias(n, s, ::findFirstIdentifier)
            })
        )
        put(
            AS_PATTERN,
            Extract.Identifier(customSingle = {
                n,
                s
                ->
                extractFromAsPattern(
                    n,
                    s,
                    ::findFirstIdentifier,
                    ::findLastIdentifier
                )
            })
        )
        put(
            DECORATOR,
            Extract.Identifier(customSingle = {
                n,
                s
                ->
                extractDecoratorName(n, s, ::findFirstIdentifier)
            })
        )

        // Identifiers - multi extractors for nodes that can contain multiple identifiers
        put(
            FOR_IN_CLAUSE,
            Extract.Identifier(
                customSingle = { n, s -> extractLoopVariables(n, s).firstOrNull() },
                customMulti = ::extractLoopVariables
            )
        )
        put(
            FOR_STATEMENT,
            Extract.Identifier(
                customSingle = { n, s -> extractLoopVariables(n, s).firstOrNull() },
                customMulti = ::extractLoopVariables
            )
        )
        put(
            GLOBAL_STATEMENT,
            Extract.Identifier(
                customSingle = { n, s -> extractAllIdentifiers(n, s).firstOrNull() },
                customMulti = ::extractAllIdentifiers
            )
        )
        put(
            NONLOCAL_STATEMENT,
            Extract.Identifier(
                customSingle = { n, s -> extractAllIdentifiers(n, s).firstOrNull() },
                customMulti = ::extractAllIdentifiers
            )
        )
        put(
            CASE_CLAUSE,
            Extract.Identifier(customMulti = {
                n,
                s
                ->
                extractPatternCaptureVariables(n, s, ::findFirstIdentifier)
            })
        )

        // Comments - line comments and docstrings
        put(COMMENT, Extract.Comment(format = CommentFormats.Line("#")))
        put(EXPRESSION_STATEMENT, Extract.Comment(custom = ::extractDocstring))

        // Strings - Python string literals
        put(STRING, Extract.StringLiteral(custom = ::extractString))
    }
}
