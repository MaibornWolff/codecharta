package de.maibornwolff.treesitter.excavationsite.integration.extraction

import de.maibornwolff.treesitter.excavationsite.integration.extraction.extractors.common.CommentExtractor
import de.maibornwolff.treesitter.excavationsite.integration.extraction.extractors.common.StringExtractor
import de.maibornwolff.treesitter.excavationsite.integration.extraction.ports.ExtractionNodeTypes
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractedText
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm.FfmGrammar
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm.FfmSyntaxTree

/**
 * Extracts text using an ExtractionNodeTypes port.
 *
 * Walks the AST and looks up each node type in the port's nodeExtractions map
 * to determine what to extract.
 */
internal class DirectTextExtractor(private val grammar: FfmGrammar, private val extractionNodeTypes: ExtractionNodeTypes) {
    private val commentExtractor = CommentExtractor(extractionNodeTypes.commentFormats)
    private val stringExtractor = StringExtractor(extractionNodeTypes.stringFormats)

    /**
     * Extracts all text from the given source code.
     *
     * @param content The source code content to analyze
     * @return List of extracted text items with their contexts
     */
    fun extract(content: String): List<ExtractedText> {
        if (content.isBlank()) {
            return emptyList()
        }

        val results = mutableListOf<ExtractedText>()

        FfmSyntaxTree.parse(content, grammar).use { tree ->
            tree.walk { node, nodeType -> processNode(node, nodeType, content, results) }
        }

        return results
    }

    private fun processNode(node: SyntaxNode, nodeType: String, sourceCode: String, results: MutableList<ExtractedText>) {
        val extraction = extractionNodeTypes.nodeExtractions[nodeType] ?: return

        when (extraction) {
            is Extract.Identifier -> extractIdentifiers(node, sourceCode, extraction, results)
            is Extract.Comment -> extractComment(node, sourceCode, extraction, results)
            is Extract.StringLiteral -> extractString(node, sourceCode, extraction, results)
        }
    }

    private fun extractIdentifiers(
        node: SyntaxNode,
        sourceCode: String,
        extraction: Extract.Identifier,
        results: MutableList<ExtractedText>
    ) {
        // Priority: customMulti > multi strategy > customSingle > single strategy
        extraction.customMulti?.let { customMulti ->
            val identifiers = customMulti(node, sourceCode)
            identifiers.forEach { identifier ->
                results.add(ExtractedText(identifier, ExtractionContext.IDENTIFIER))
            }
            return
        }

        extraction.multi?.let { multiStrategy ->
            val identifiers = ExtractionExecutor.extractMultiple(node, sourceCode, multiStrategy)
            identifiers.forEach { identifier ->
                results.add(ExtractedText(identifier, ExtractionContext.IDENTIFIER))
            }
            return
        }

        extraction.customSingle?.let { customSingle ->
            customSingle(node, sourceCode)?.let { identifier ->
                results.add(ExtractedText(identifier, ExtractionContext.IDENTIFIER))
            }
            return
        }

        extraction.single?.let { singleStrategy ->
            ExtractionExecutor.extractSingle(node, sourceCode, singleStrategy)?.let { identifier ->
                results.add(ExtractedText(identifier, ExtractionContext.IDENTIFIER))
            }
        }
    }

    private fun extractComment(node: SyntaxNode, sourceCode: String, extraction: Extract.Comment, results: MutableList<ExtractedText>) {
        // Custom extractors can return null to indicate "skip this node"
        val text = if (extraction.custom != null) {
            extraction.custom.invoke(node, sourceCode) ?: return
        } else {
            commentExtractor.extract(node, sourceCode)
        }

        results.add(ExtractedText(text, ExtractionContext.COMMENT))
    }

    private fun extractString(
        node: SyntaxNode,
        sourceCode: String,
        extraction: Extract.StringLiteral,
        results: MutableList<ExtractedText>
    ) {
        // Custom extractors can return null to indicate "skip this node"
        val text = if (extraction.custom != null) {
            extraction.custom.invoke(node, sourceCode) ?: return
        } else {
            stringExtractor.extract(node, sourceCode)
        }

        results.add(ExtractedText(text, ExtractionContext.STRING))
    }
}
