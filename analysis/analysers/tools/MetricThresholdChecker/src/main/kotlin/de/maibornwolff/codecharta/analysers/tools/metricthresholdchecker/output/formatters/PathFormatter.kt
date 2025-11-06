package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters

class PathFormatter {
    companion object {
        private const val ELLIPSIS = "..."
    }

    fun truncate(path: String, maxWidth: Int): String {
        if (path.length <= maxWidth) {
            return path
        }

        val prefixLength = (maxWidth - ELLIPSIS.length) / 2
        val suffixLength = maxWidth - ELLIPSIS.length - prefixLength

        return path.substring(0, prefixLength) + ELLIPSIS + path.substring(path.length - suffixLength)
    }
}
