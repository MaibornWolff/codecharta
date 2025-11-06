package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters

class PathFormatter {
    companion object {
        private const val ELLIPSIS = "..."
    }

    fun truncate(path: String, maxWidth: Int): String {
        if (path.length <= maxWidth) {
            return path
        }

        val suffixLength = maxWidth - ELLIPSIS.length

        return ELLIPSIS + path.substring(path.length - suffixLength)
    }
}
