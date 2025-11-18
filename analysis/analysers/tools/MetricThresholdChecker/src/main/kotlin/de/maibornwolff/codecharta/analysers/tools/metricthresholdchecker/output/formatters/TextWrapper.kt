package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters

class TextWrapper {
    companion object {
        private const val SPACE_LENGTH = 1
    }

    fun wrap(text: String, maxWidth: Int, indent: String): List<String> {
        val words = extractWords(text)
        if (words.isEmpty()) return emptyList()

        val lines = mutableListOf<String>()
        val currentLine = StringBuilder(indent)

        for (word in words) {
            if (shouldStartNewLine(currentLine, word, maxWidth, indent)) {
                lines.add(currentLine.toString())
                startNewLine(currentLine, indent, word)
            } else {
                appendWordToCurrentLine(currentLine, word, indent)
            }
        }

        if (hasContent(currentLine, indent)) {
            lines.add(currentLine.toString())
        }

        return lines
    }

    private fun extractWords(text: String): List<String> {
        return text.split(" ").filter { it.isNotEmpty() }
    }

    private fun shouldStartNewLine(currentLine: StringBuilder, word: String, maxWidth: Int, indent: String): Boolean {
        val hasContentAlready = hasContent(currentLine, indent)
        if (!hasContentAlready) return false

        val lengthWithSpace = currentLine.length + SPACE_LENGTH + word.length
        return lengthWithSpace > maxWidth
    }

    private fun hasContent(line: StringBuilder, indent: String): Boolean {
        return line.length > indent.length
    }

    private fun startNewLine(currentLine: StringBuilder, indent: String, firstWord: String) {
        currentLine.clear()
        currentLine.append(indent).append(firstWord)
    }

    private fun appendWordToCurrentLine(currentLine: StringBuilder, word: String, indent: String) {
        if (hasContent(currentLine, indent)) {
            currentLine.append(" ")
        }
        currentLine.append(word)
    }
}
