package de.maibornwolff.codecharta.analysers.tools.gate.report

import de.maibornwolff.codecharta.analysers.tools.gate.rules.Violation

object CycleText {
    private const val INDENT = "  "

    fun lines(cycles: List<Violation>): List<String> = cycles.flatMapIndexed { index, cycle ->
        val separator = if (index > 0) listOf("") else emptyList()
        separator + header(cycle, index + 1, cycles.size) + memberLines(cycle)
    }

    private fun header(cycle: Violation, number: Int, count: Int): String {
        val folder = sharedFolder(cycle.members)
        val location = if (folder.isEmpty()) "" else " in $folder"
        return "${INDENT}cycle $number of $count, ${cycle.members.size} files$location"
    }

    private fun memberLines(cycle: Violation): List<String> {
        val folder = sharedFolder(cycle.members)
        val width = cycle.members.maxOf { it.length } - folder.length
        return cycle.members.map { member ->
            val targets = cycle.dependencies[member].orEmpty().joinToString(", ") { it.removePrefix(folder) }
            "$INDENT$INDENT${member.removePrefix(folder).padEnd(width)} → $targets"
        }
    }
}
