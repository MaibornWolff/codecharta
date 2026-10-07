package de.maibornwolff.treesitter.excavationsite.integration.extraction.extractors.common

import de.maibornwolff.treesitter.excavationsite.shared.domain.StringFormats
import de.maibornwolff.treesitter.excavationsite.shared.domain.StringParser
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * Generic string extractor that handles various string literal formats.
 *
 * @param stringFormats Map of node type to string format
 */
class StringExtractor(private val stringFormats: Map<String, StringFormats>) {
    /**
     * Extracts string content from a node, stripping appropriate delimiters.
     */
    fun extract(node: SyntaxNode): String {
        val text = node.text
        val format = stringFormats[node.type] ?: return text

        return when (format) {
            is StringFormats.Quoted -> {
                if (format.stripSingleQuotes) {
                    StringParser.stripAnyQuotes(text)
                } else {
                    text.removeSurrounding("\"")
                }
            }
            is StringFormats.Template -> StringParser.stripBackticks(text)
            is StringFormats.TripleQuoted -> StringParser.stripTripleQuotes(text).removeSurrounding("\"")
            is StringFormats.JavaTextBlock -> extractJavaTextBlock(text)
            is StringFormats.CppRaw -> StringParser.stripCppRawString(text)
            is StringFormats.CSharpRaw -> StringParser.stripCSharpRawString(text)
            is StringFormats.CSharpVerbatim -> StringParser.stripCSharpVerbatimString(text)
            is StringFormats.CSharpInterpolated -> StringParser.stripCSharpInterpolatedString(text)
            is StringFormats.Python -> StringParser.stripPythonString(text)
            is StringFormats.FromChild -> extractFromChild(node, format.childType)
            is StringFormats.Trimmed -> text.trim()
            is StringFormats.Regex -> text.removePrefix("/").removeSuffix("/")
            is StringFormats.PhpHeredoc -> extractPhpHeredoc(text)
            is StringFormats.RubySymbol -> text.removePrefix(":")
        }
    }

    private fun extractJavaTextBlock(text: String): String = if (text.startsWith("\"\"\"")) {
        StringParser.extractJavaTextBlock(text)
    } else {
        text.removeSurrounding("\"")
    }

    private fun extractFromChild(node: SyntaxNode, childType: String): String {
        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            if (child.type == childType) {
                return child.text
            }
        }
        val text = node.text
        return StringParser.stripTripleQuotes(text).removeSurrounding("\"")
    }

    private fun extractPhpHeredoc(text: String): String {
        val lines = text.lines()
        if (lines.size <= 2) return ""
        return lines.drop(1).dropLast(1).joinToString("\n")
    }
}
