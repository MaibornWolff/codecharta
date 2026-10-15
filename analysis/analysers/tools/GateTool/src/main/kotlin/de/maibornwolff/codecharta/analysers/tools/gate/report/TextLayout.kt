package de.maibornwolff.codecharta.analysers.tools.gate.report

import de.maibornwolff.codecharta.analysers.tools.gate.rules.Declaration
import de.maibornwolff.codecharta.model.NodeId

object TextLayout {
    const val INDENT = "  "

    fun declarationText(declaration: Declaration, folder: String): String =
        if (declaration.file == folder) declaration.name else "${declaration.file.removePrefix(folder)}: ${declaration.name}"

    fun arrowLines(pairs: List<Pair<String, String>>): List<String> {
        val width = pairs.maxOf { it.first.length }
        return pairs.map { (from, to) -> "$INDENT$INDENT${from.padEnd(width)} → $to" }
    }
}

fun sharedFolder(paths: List<String>): String {
    val shared = paths.map { it.split(NodeId.SEPARATOR).dropLast(1) }.reduce(::commonStart)
    return if (shared.isEmpty()) "" else shared.joinToString(NodeId.SEPARATOR) + NodeId.SEPARATOR
}

private fun commonStart(first: List<String>, second: List<String>): List<String> =
    first.zip(second).takeWhile { (left, right) -> left == right }.map { it.first }
