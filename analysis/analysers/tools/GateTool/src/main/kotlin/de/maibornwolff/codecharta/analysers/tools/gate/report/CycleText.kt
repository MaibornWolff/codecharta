package de.maibornwolff.codecharta.analysers.tools.gate.report

import de.maibornwolff.codecharta.analysers.tools.gate.rules.Declaration
import de.maibornwolff.codecharta.analysers.tools.gate.rules.Violation
import de.maibornwolff.codecharta.analysers.tools.gate.rules.ViolationKind

object CycleText {
    private const val INDENT = "  "

    fun lines(cycles: List<Violation>): List<String> = cycles.flatMapIndexed { index, cycle ->
        val separator = if (index > 0) listOf("") else emptyList()
        val folder = if (cycle.kind == ViolationKind.CYCLE_INSIDE_FILE) cycle.path!! else sharedFolder(cycle.members)
        separator + header(cycle, index + 1, cycles.size) + stepLines(cycle.declarations, folder)
    }

    private fun header(cycle: Violation, number: Int, count: Int): String {
        if (cycle.kind == ViolationKind.CYCLE_INSIDE_FILE) return "${INDENT}cycle $number of $count in ${cycle.path}"
        val folder = sharedFolder(cycle.members)
        val location = if (folder.isEmpty()) "" else " in $folder"
        return "${INDENT}cycle $number of $count, ${cycle.members.size} files$location"
    }

    private fun stepLines(declarations: List<Declaration>, folder: String): List<String> {
        val steps = declarations.indices.map { index -> declarations[index] to declarations[(index + 1) % declarations.size] }
        return arrowLines(steps.map { (from, to) -> declarationText(from, folder) to declarationText(to, folder) })
    }
}

fun declarationText(declaration: Declaration, folder: String): String =
    if (declaration.file == folder) declaration.name else "${declaration.file.removePrefix(folder)}: ${declaration.name}"

fun arrowLines(pairs: List<Pair<String, String>>): List<String> {
    val width = pairs.maxOf { it.first.length }
    return pairs.map { (from, to) -> "    ${from.padEnd(width)} → $to" }
}
