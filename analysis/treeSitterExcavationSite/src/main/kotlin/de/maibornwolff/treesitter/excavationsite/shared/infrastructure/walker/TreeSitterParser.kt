package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker

import org.treesitter.TSLanguage
import org.treesitter.TSNode
import org.treesitter.TSParser

/**
 * Shared TreeSitter parsing utility.
 *
 * Centralizes the parsing logic used by both MetricCollector and TextExtractor.
 */
object TreeSitterParser {
    /**
     * Parses source code and returns the root AST node.
     *
     * @param content The source code to parse
     * @param language The TreeSitter language to use
     * @return The root node of the parsed AST
     */
    fun parse(content: String, language: TSLanguage): TSNode {
        val parser = TSParser()
        parser.language = language
        return parser.parseString(null, content).rootNode
    }
}
