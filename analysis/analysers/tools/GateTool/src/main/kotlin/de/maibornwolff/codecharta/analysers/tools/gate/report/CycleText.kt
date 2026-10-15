package de.maibornwolff.codecharta.analysers.tools.gate.report

import de.maibornwolff.codecharta.analysers.tools.gate.rules.Violation

class CycleText(private val memberNoun: String) {
    fun lines(cycles: List<Violation>): List<String> = cycles.flatMapIndexed { index, cycle ->
        val separator = if (index > 0) listOf("") else emptyList()
        separator + header(cycle, index + 1, cycles.size) + memberLines(cycle)
    }

    private fun header(cycle: Violation, number: Int, count: Int): String {
        val folder = sharedFolder(cycle.members)
        val location = if (folder.isEmpty()) "" else " in $folder"
        return "${INDENT}cycle $number of $count, ${cycle.members.size} ${memberNoun}s$location"
    }

    private fun memberLines(cycle: Violation): List<String> {
        val folder = sharedFolder(cycle.members)
        val width = cycle.members.maxOf { it.length } - folder.length
        return cycle.members.map { member ->
            val targets = cycle.dependencies[member].orEmpty().joinToString(", ") { it.removePrefix(folder) }
            "$INDENT$INDENT${member.removePrefix(folder).padEnd(width)} → $targets"
        }
    }

    private fun sharedFolder(members: List<String>): String {
        val folders = members.map { it.split(PATH_SEPARATOR).dropLast(1) }
        val shared = folders.reduce(::commonStart)
        return if (shared.isEmpty()) "" else shared.joinToString(PATH_SEPARATOR) + PATH_SEPARATOR
    }

    private fun commonStart(first: List<String>, second: List<String>): List<String> =
        first.zip(second).takeWhile { (left, right) -> left == right }.map { it.first }

    companion object {
        private const val INDENT = "  "
        private const val PATH_SEPARATOR = "/"
    }
}
