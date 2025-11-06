package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters

class TextWrapper {
    companion object {
        private const val WORD_SEPARATOR_LENGTH = 1
    }

    fun wrap(text: String, maxWidth: Int, indent: String): List<String> {
        if (text.isEmpty()) {
            return emptyList()
        }

        val words = text.split(" ").filter { it.isNotEmpty() }
        if (words.isEmpty()) {
            return emptyList()
        }

        val lines = mutableListOf<String>()
        var currentLine = StringBuilder(indent)

        for (word in words) {
            val wouldExceedMaxWidth =
                currentLine.length + word.length + WORD_SEPARATOR_LENGTH > maxWidth + indent.length

            if (wouldExceedMaxWidth && currentLine.length > indent.length) {
                lines.add(currentLine.toString())
                currentLine = StringBuilder(indent)
                currentLine.append(word)
                continue
            }

            if (currentLine.length > indent.length) {
                currentLine.append(" ")
            }
            currentLine.append(word)
        }

        if (currentLine.length > indent.length) {
            lines.add(currentLine.toString())
        }

        return lines
    }
}
