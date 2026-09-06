package de.maibornwolff.treesitter.excavationsite.languages.ruby

import de.maibornwolff.treesitter.excavationsite.languages.ruby.extractors.extractAliasIdentifiers
import de.maibornwolff.treesitter.excavationsite.languages.ruby.extractors.extractAttrSymbols
import de.maibornwolff.treesitter.excavationsite.languages.ruby.extractors.extractFromAssignment
import de.maibornwolff.treesitter.excavationsite.languages.ruby.extractors.extractFromClassOrModule
import de.maibornwolff.treesitter.excavationsite.languages.ruby.extractors.extractFromClassOrModuleMultiple
import de.maibornwolff.treesitter.excavationsite.languages.ruby.extractors.extractFromHashKeySymbol
import de.maibornwolff.treesitter.excavationsite.languages.ruby.extractors.extractFromIdentifierInContext
import de.maibornwolff.treesitter.excavationsite.languages.ruby.extractors.extractFromRescue
import de.maibornwolff.treesitter.excavationsite.languages.ruby.extractors.extractNonImportString
import de.maibornwolff.treesitter.excavationsite.shared.domain.CommentFormats
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionStrategy
import de.maibornwolff.treesitter.excavationsite.shared.domain.StringFormats

/**
 * Ruby extraction definitions.
 */
object RubyExtractionMapping : ExtractionMapping {
    private const val IDENTIFIER = "identifier"
    private const val STRING_CONTENT = "string_content"
    private const val SIMPLE_SYMBOL = "simple_symbol"
    private const val KEYWORD_PATTERN = "keyword_pattern"
    private const val CALL = "call"
    private const val CLASS = "class"
    private const val MODULE = "module"
    private const val METHOD = "method"
    private const val SINGLETON_METHOD = "singleton_method"
    private const val ASSIGNMENT = "assignment"
    private const val KEYWORD_PARAMETER = "keyword_parameter"
    private const val OPTIONAL_PARAMETER = "optional_parameter"
    private const val SPLAT_PARAMETER = "splat_parameter"
    private const val HASH_SPLAT_PARAMETER = "hash_splat_parameter"
    private const val BLOCK_PARAMETER = "block_parameter"
    private const val RESCUE = "rescue"
    private const val ALIAS = "alias"
    private const val FOR = "for"
    private const val REST_ASSIGNMENT = "rest_assignment"
    private const val HASH_KEY_SYMBOL = "hash_key_symbol"
    private const val COMMENT = "comment"
    private const val STRING = "string"
    private const val DELIMITED_SYMBOL = "delimited_symbol"
    private const val HEREDOC_BODY = "heredoc_body"
    private const val REGEX = "regex"
    private const val BARE_STRING = "bare_string"
    private const val BARE_SYMBOL = "bare_symbol"

    override val nodeExtractions: Map<String, Extract> = buildMap {
        // Identifiers - simple first child
        put(METHOD, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put(SINGLETON_METHOD, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put(KEYWORD_PARAMETER, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put(OPTIONAL_PARAMETER, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put(SPLAT_PARAMETER, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put(HASH_SPLAT_PARAMETER, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put(BLOCK_PARAMETER, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put(REST_ASSIGNMENT, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put(KEYWORD_PATTERN, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))
        put(FOR, Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))

        // Identifiers - custom single extractors
        put(
            CLASS,
            Extract.Identifier(
                customSingle = ::extractFromClassOrModule,
                customMulti = ::extractFromClassOrModuleMultiple
            )
        )
        put(
            MODULE,
            Extract.Identifier(
                customSingle = ::extractFromClassOrModule,
                customMulti = ::extractFromClassOrModuleMultiple
            )
        )
        put(ASSIGNMENT, Extract.Identifier(customSingle = ::extractFromAssignment))
        put(IDENTIFIER, Extract.Identifier(customSingle = ::extractFromIdentifierInContext))
        put(RESCUE, Extract.Identifier(customSingle = ::extractFromRescue))
        put(HASH_KEY_SYMBOL, Extract.Identifier(customSingle = ::extractFromHashKeySymbol))

        // Identifiers - custom multi extractors
        put(ALIAS, Extract.Identifier(customMulti = ::extractAliasIdentifiers))
        put(CALL, Extract.Identifier(customMulti = ::extractAttrSymbols))

        // Comments
        put(COMMENT, Extract.Comment(CommentFormats.AutoDetect))

        // Strings (skip require/require_relative paths)
        put(STRING, Extract.StringLiteral(custom = ::extractNonImportString))
        put(SIMPLE_SYMBOL, Extract.StringLiteral(format = StringFormats.RubySymbol))
        put(DELIMITED_SYMBOL, Extract.StringLiteral(format = StringFormats.FromChild(STRING_CONTENT)))
        put(HEREDOC_BODY, Extract.StringLiteral(format = StringFormats.Trimmed))
        put(REGEX, Extract.StringLiteral(format = StringFormats.Regex))
        put(BARE_STRING, Extract.StringLiteral(format = StringFormats.FromChild(STRING_CONTENT)))
        put(BARE_SYMBOL, Extract.StringLiteral(format = StringFormats.FromChild(STRING_CONTENT)))
    }
}
