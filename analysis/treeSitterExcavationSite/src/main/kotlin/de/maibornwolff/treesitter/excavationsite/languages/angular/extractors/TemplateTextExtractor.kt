package de.maibornwolff.treesitter.excavationsite.languages.angular.extractors

import de.maibornwolff.treesitter.excavationsite.languages.angular.ENTITY
import de.maibornwolff.treesitter.excavationsite.languages.angular.TEXT
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

private val TEXT_PARTS = setOf(TEXT, ENTITY)
private const val GAP = " "

/**
 * Extracts the text of an element that a run of text and entity nodes makes up, read once from the first node of the
 * run: the grammar splits `caf&eacute;teria` into three nodes, which together are one word. Entities are resolved
 * like those of an attribute value, see [decodeHtmlEntities].
 */
internal fun extractTemplateText(node: SyntaxNode): String? {
    if (node.prevSibling.orNull()?.type in TEXT_PARTS) return null
    val siblings = node.parent.children().toList()
    val run = siblings.drop(siblings.indexOf(node)).takeWhile { it.type in TEXT_PARTS }
    val text = StringBuilder()
    run.forEachIndexed { index, part ->
        if (index > 0 && run[index - 1].endByte < part.startByte) text.append(GAP)
        text.append(if (part.type == ENTITY) decodeHtmlEntities(part.text) else part.text)
    }
    return text.toString().trim().ifEmpty { null }
}
