package de.maibornwolff.treesitter.excavationsite.integration.extraction

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TextRun

/**
 * Reads the runs of a walk from their parent, which steps through its children once: a node of a run that asked for
 * its own siblings would cost quadratic time in an element with many texts between its child elements. A run's text
 * is handed out when the walk reaches the run's first node, so the texts keep the order of the source.
 */
internal class TextRunReader(private val textRun: TextRun) {
    private val textByRunStart = HashMap<Int, String>()

    fun takeTextStartingAt(node: SyntaxNode, nodeType: String): String? =
        if (nodeType in textRun.partTypes) textByRunStart.remove(node.startByte) else null

    fun readRunsBelow(parent: SyntaxNode) {
        val run = mutableListOf<SyntaxNode>()
        parent.children().forEach { child ->
            if (child.type in textRun.partTypes) {
                run.add(child)
            } else {
                rememberText(run)
                run.clear()
            }
        }
        rememberText(run)
    }

    private fun rememberText(run: List<SyntaxNode>) {
        if (run.isEmpty()) return
        val text = textRun.join(run) ?: return
        textByRunStart[run.first().startByte] = text
    }
}
