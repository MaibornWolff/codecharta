package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.jni

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import org.treesitter.TSLanguage
import org.treesitter.TSNode
import org.treesitter.TSParser

/**
 * A node of the JNI binding seen as a [SyntaxNode], for dependency extraction, which parses with that binding.
 *
 * @param utf8Source the source as UTF-8. The JNI binding drops U+FEFF, U+FFFE and U+FFFF before it parses, so
 * [text] is shifted behind such a character
 */
internal class TsNodeSyntaxNode(private val node: TSNode, private val utf8Source: ByteArray) : SyntaxNode {
    override val type: String get() = node.type
    override val isNull: Boolean get() = node.isNull
    override val childCount: Int get() = node.childCount
    override val namedChildCount: Int get() = node.namedChildCount
    override val startRow: Int get() = node.startPoint.row
    override val startColumn: Int get() = node.startPoint.column
    override val endRow: Int get() = node.endPoint.row
    override val endColumn: Int get() = node.endPoint.column
    override val startByte: Int get() = node.startByte
    override val endByte: Int get() = node.endByte
    override val text: String get() = String(utf8Source, startByte, endByte - startByte, Charsets.UTF_8)
    override val parent: SyntaxNode get() = TsNodeSyntaxNode(node.parent, utf8Source)
    override val prevSibling: SyntaxNode get() = TsNodeSyntaxNode(node.prevSibling, utf8Source)

    override fun getChild(index: Int): SyntaxNode = TsNodeSyntaxNode(node.getChild(index), utf8Source)

    override fun getNamedChild(index: Int): SyntaxNode = TsNodeSyntaxNode(node.getNamedChild(index), utf8Source)

    override fun getChildByFieldName(name: String): SyntaxNode = TsNodeSyntaxNode(node.getChildByFieldName(name), utf8Source)

    override fun equals(other: Any?): Boolean = other is TsNodeSyntaxNode && other.node == node

    override fun hashCode(): Int = node.hashCode()

    companion object {
        fun parse(content: String, language: TSLanguage): SyntaxNode {
            val parser = TSParser()
            parser.language = language
            return TsNodeSyntaxNode(parser.parseString(null, content).rootNode, content.toByteArray(Charsets.UTF_8))
        }
    }
}
