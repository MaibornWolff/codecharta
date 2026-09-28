package de.maibornwolff.treesitter.excavationsite.integration.extraction.extractors.common

import de.maibornwolff.treesitter.excavationsite.shared.domain.CommentFormats
import de.maibornwolff.treesitter.excavationsite.shared.domain.CommentParser
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

/**
 * Generic comment extractor that handles various comment formats.
 *
 * @param commentFormats Map of node type to comment format
 */
class CommentExtractor(private val commentFormats: Map<String, CommentFormats>) {
    /**
     * Extracts comment text from a node, stripping appropriate markers.
     */
    fun extract(node: TSNode, sourceCode: String): String {
        val text = TreeTraversal.getNodeText(node, sourceCode)
        val format = commentFormats[node.type] ?: return text

        return when (format) {
            is CommentFormats.Line -> CommentParser.stripLineComment(text, format.prefix)
            is CommentFormats.Block -> CommentParser.stripBlockComment(text)
            is CommentFormats.XmlDoc -> CommentParser.stripXmlDocComment(text)
            is CommentFormats.Html -> CommentParser.stripHtmlComment(text)
            is CommentFormats.RubyMultiline -> CommentParser.stripRubyMultilineComment(text)
            is CommentFormats.AutoDetect -> CommentParser.stripCommentMarkers(text)
        }
    }
}
