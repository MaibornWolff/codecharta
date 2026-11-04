package de.maibornwolff.treesitter.excavationsite.languages.angular.extractors

import de.maibornwolff.treesitter.excavationsite.languages.angular.ENTITY
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val GAP = " "

/**
 * Joins the text and entity nodes of one run into the text of an element: the grammar splits `caf&eacute;teria` into
 * three nodes, which together are one word. Entities are resolved like those of an attribute value, see
 * [decodeHtmlEntities].
 */
internal fun joinTemplateText(run: List<SyntaxNode>): String? {
    val text = StringBuilder()
    var previousEndByte: Int? = null
    run.forEach { part ->
        val startByte = part.startByte
        if (previousEndByte != null && previousEndByte < startByte) text.append(GAP)
        text.append(if (part.type == ENTITY) decodeHtmlEntities(part.text) else part.text)
        previousEndByte = part.endByte
    }
    return text.toString().trim().ifEmpty { null }
}
