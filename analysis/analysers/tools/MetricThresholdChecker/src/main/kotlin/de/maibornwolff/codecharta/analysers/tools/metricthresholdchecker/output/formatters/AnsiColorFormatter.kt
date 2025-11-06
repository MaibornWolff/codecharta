package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters

object AnsiColorFormatter {
    private const val RED = "\u001B[31m"
    private const val GREEN = "\u001B[32m"
    private const val YELLOW = "\u001B[33m"
    private const val RESET = "\u001B[0m"
    private const val BOLD = "\u001B[1m"

    fun red(text: String): String {
        return "$RED$text$RESET"
    }

    fun green(text: String): String {
        return "$GREEN$text$RESET"
    }

    fun yellow(text: String): String {
        return "$YELLOW$text$RESET"
    }

    fun bold(text: String): String {
        return "$BOLD$text$RESET"
    }

    fun success(text: String): String {
        return green(text)
    }

    fun error(text: String): String {
        return red(text)
    }

    fun warning(text: String): String {
        return yellow(text)
    }
}
