package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters

class TextWrapper {
    companion object {
        private const val WORD_SEPARATOR_LENGTH = 1
    }

    fun wrap(text: String, maxWidth: Int, indent: String): List<String> {
        val words = text.split(" ").filter { it.isNotEmpty() }
        if (words.isEmpty()) return emptyList()

        val lines = mutableListOf<String>()
        val currentLine = StringBuilder(indent)
        val maxLineLength = maxWidth + indent.length

        words.forEach { word ->
            val needsSpace = currentLine.length > indent.length
            val nextLength = currentLine.length + (if (needsSpace) WORD_SEPARATOR_LENGTH else 0) + word.length

            if (nextLength > maxLineLength && needsSpace) {
                lines.add(currentLine.toString())
                currentLine.clear()
                currentLine.append(indent).append(word)
            } else {
                if (needsSpace) currentLine.append(" ")
                currentLine.append(word)
            }
        }

        if (currentLine.length > indent.length) {
            lines.add(currentLine.toString())
        }

        return lines
    }
}
