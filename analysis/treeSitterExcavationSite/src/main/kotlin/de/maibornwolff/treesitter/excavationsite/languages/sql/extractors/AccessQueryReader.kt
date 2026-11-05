package de.maibornwolff.treesitter.excavationsite.languages.sql.extractors

import de.maibornwolff.treesitter.excavationsite.languages.sql.model.AccessQuery
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * Reads an Access query, whose SQL the grammar reads like any other: its names, and the forms and reports a bang chain
 * names. A chain `[Forms]![frmOrders]![sfrmLines].[Form]![txtId]` is no name of the database; its second link is the
 * form, the rest are its controls.
 */
internal object AccessQueryReader {
    private const val OBJECT_NAME = "object_name"
    private const val OPERATOR = "operator"
    private const val BANG = "!"
    private const val FORMS = "forms"
    private const val REPORTS = "reports"

    private class BangChain(val collection: String, val objectName: String, val links: List<SyntaxNode>)

    fun read(root: SyntaxNode): AccessQuery {
        val chains = bangChainsBelow(root)
        val skipped = chains.flatMap { chain -> chain.links.map { it.startByte to it.endByte } }.toSet()
        val names = SqlNameCollector(emptySet(), inPackage = false, skipped = skipped).namesOfTokens(root.children().toList())
        return AccessQuery(names, objectsOf(chains, FORMS), objectsOf(chains, REPORTS))
    }

    private fun objectsOf(chains: List<BangChain>, collection: String): List<String> =
        chains.filter { it.collection == collection }.map { it.objectName }.distinct()

    private fun bangChainsBelow(node: SyntaxNode): List<BangChain> {
        val children = node.children().toList()
        return children.indices.mapNotNull { chainAt(children, it) } + children.flatMap { bangChainsBelow(it) }
    }

    private fun chainAt(children: List<SyntaxNode>, start: Int): BangChain? {
        val collection = singlePartOf(children[start])?.lowercase()?.takeIf { it == FORMS || it == REPORTS } ?: return null
        if (!isBang(children.getOrNull(start + 1))) return null
        val objectName = children.getOrNull(start + 2)?.let { firstPartOf(it) } ?: return null
        var end = start + 2
        while (isBang(children.getOrNull(end + 1)) && children.getOrNull(end + 2)?.type == OBJECT_NAME) end += 2
        return BangChain(collection, objectName, children.subList(start, end + 1))
    }

    private fun isBang(node: SyntaxNode?): Boolean = node != null && node.type == OPERATOR && node.text == BANG

    private fun singlePartOf(node: SyntaxNode): String? = SqlNames.partsOf(node).singleOrNull()?.takeIf { node.type == OBJECT_NAME }

    private fun firstPartOf(node: SyntaxNode): String? = SqlNames.partsOf(node).firstOrNull()?.takeIf { node.type == OBJECT_NAME }
}
