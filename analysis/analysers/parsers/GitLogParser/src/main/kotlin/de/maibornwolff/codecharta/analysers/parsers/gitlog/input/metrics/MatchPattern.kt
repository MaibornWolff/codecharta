package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

sealed class MatchPattern {
    abstract fun matches(message: String): Boolean

    data class StartsWith(val prefix: String) : MatchPattern() {
        override fun matches(message: String): Boolean {
            return message.trim().startsWith(prefix, ignoreCase = true)
        }
    }
}
