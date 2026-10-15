package de.maibornwolff.codecharta.analysers.tools.gate.report

object InstructionBox {
    private const val TITLE = "┌ Instruction "
    private const val BOTTOM_CORNER = "└"
    private const val SIDE = "│ "
    private const val LINE = '─'
    private const val TEXT_WIDTH = 76

    fun lines(instruction: String): List<String> {
        val textLines = instruction.lines().flatMap(::wrapped)
        val width = maxOf(textLines.maxOf { it.length }, TITLE.length) + SIDE.length
        return listOf(TITLE.padEnd(width, LINE)) + textLines.map { SIDE + it } + BOTTOM_CORNER.padEnd(width, LINE)
    }

    private fun wrapped(text: String): List<String> {
        val lines = mutableListOf<String>()
        var current = ""
        text.split(" ").filter { it.isNotEmpty() }.forEach { word ->
            if (current.isNotEmpty() && current.length + 1 + word.length > TEXT_WIDTH) {
                lines.add(current)
                current = word
            } else {
                current = if (current.isEmpty()) word else "$current $word"
            }
        }
        return lines + current
    }
}
