package de.maibornwolff.codecharta.analysers.tools.gate.report

import de.maibornwolff.codecharta.analysers.tools.gate.rules.CycleViolation

object CycleText {
    fun lines(cycles: List<CycleViolation>): List<String> = cycles.flatMapIndexed { index, cycle ->
        val separator = if (index > 0) listOf("") else emptyList()
        val folder = if (cycle.isInsideOneFile) cycle.files.single() else sharedFolder(cycle.files)
        separator + header(cycle, folder, index + 1, cycles.size) + stepLines(cycle, folder)
    }

    private fun header(cycle: CycleViolation, folder: String, number: Int, count: Int): String {
        if (cycle.isInsideOneFile) return "${TextLayout.INDENT}cycle $number of $count in $folder"
        val location = if (folder.isEmpty()) "" else " in $folder"
        return "${TextLayout.INDENT}cycle $number of $count, ${cycle.files.size} files$location"
    }

    private fun stepLines(cycle: CycleViolation, folder: String): List<String> {
        val declarations = cycle.declarations
        val steps = declarations.indices.map { index -> declarations[index] to declarations[(index + 1) % declarations.size] }
        return TextLayout.arrowLines(
            steps.map { (from, to) ->
                TextLayout.declarationText(from, folder) to
                    TextLayout.declarationText(to, folder)
            }
        )
    }
}
