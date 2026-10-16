package de.maibornwolff.treesitter.excavationsite.integration.extraction

import de.maibornwolff.treesitter.excavationsite.integration.extraction.extractors.common.CommentExtractor
import de.maibornwolff.treesitter.excavationsite.integration.extraction.extractors.common.StringExtractor
import de.maibornwolff.treesitter.excavationsite.integration.extraction.ports.ExtractionNodeTypes
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractedText
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm.FfmSyntaxTree

/**
 * Extracts text using an ExtractionNodeTypes port.
 *
 * Walks the AST and looks up each node type in the port's nodeExtractions map
 * to determine what to extract.
 */
internal class DirectTextExtractor(private val extractionNodeTypes: ExtractionNodeTypes) {
    private val commentExtractor = CommentExtractor(extractionNodeTypes.commentFormats)
    private val stringExtractor = StringExtractor(extractionNodeTypes.stringFormats)

    /**
     * Extracts all text from the syntax tree of a source code.
     *
     * @param tree The syntax tree of the content to analyze
     * @return List of extracted text items with their contexts
     */
    fun extract(tree: FfmSyntaxTree): List<ExtractedText> {
        val results = mutableListOf<ExtractedText>()
        tree.walk { node, nodeType -> processNode(node, nodeType, results) }
        return results
    }

    private fun processNode(node: SyntaxNode, nodeType: String, results: MutableList<ExtractedText>) {
        val extraction = extractionNodeTypes.nodeExtractions[nodeType] ?: return

        when (extraction) {
            is Extract.Identifier -> extractIdentifiers(node, extraction, results)
            is Extract.Comment -> extractComment(node, extraction, results)
            is Extract.StringLiteral -> extractString(node, extraction, results)
            // The text a user reads holds no escape sequences; an inline template's are resolved before it is parsed
            is Extract.Text ->
                extraction
                    .custom(
                        node
                    )?.let { results.add(ExtractedText(it, ExtractionContext.TEXT, interpretsEscapes = false)) }
        }
    }

    private fun extractIdentifiers(node: SyntaxNode, extraction: Extract.Identifier, results: MutableList<ExtractedText>) {
        // Priority: customMulti > multi strategy > customSingle > single strategy
        extraction.customMulti?.let { customMulti ->
            val identifiers = customMulti(node)
            identifiers.forEach { identifier ->
                results.add(ExtractedText(identifier, ExtractionContext.IDENTIFIER))
            }
            return
        }

        extraction.multi?.let { multiStrategy ->
            val identifiers = ExtractionExecutor.extractMultiple(node, multiStrategy)
            identifiers.forEach { identifier ->
                results.add(ExtractedText(identifier, ExtractionContext.IDENTIFIER))
            }
            return
        }

        extraction.customSingle?.let { customSingle ->
            customSingle(node)?.let { identifier ->
                results.add(ExtractedText(identifier, ExtractionContext.IDENTIFIER))
            }
            return
        }

        extraction.single?.let { singleStrategy ->
            ExtractionExecutor.extractSingle(node, singleStrategy)?.let { identifier ->
                results.add(ExtractedText(identifier, ExtractionContext.IDENTIFIER))
            }
        }
    }

    private fun extractComment(node: SyntaxNode, extraction: Extract.Comment, results: MutableList<ExtractedText>) {
        // Custom extractors can return null to indicate "skip this node"
        val text = if (extraction.custom != null) {
            extraction.custom.invoke(node) ?: return
        } else {
            commentExtractor.extract(node)
        }

        results.add(ExtractedText(text, ExtractionContext.COMMENT))
    }

    private fun extractString(node: SyntaxNode, extraction: Extract.StringLiteral, results: MutableList<ExtractedText>) {
        // Custom extractors can return null to indicate "skip this node"
        val text = if (extraction.custom != null) {
            extraction.custom.invoke(node) ?: return
        } else {
            stringExtractor.extract(node)
        }

        results.add(ExtractedText(text, ExtractionContext.STRING, interpretsEscapes = !extraction.isRaw(node)))
    }
}
