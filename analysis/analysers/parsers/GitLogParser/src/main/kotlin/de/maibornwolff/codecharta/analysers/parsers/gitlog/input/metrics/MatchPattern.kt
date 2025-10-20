package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

sealed class MatchPattern {
    abstract fun matches(message: String): Boolean

    data class StartsWith(val prefix: String) : MatchPattern() {
        override fun matches(message: String): Boolean {
            return message.trim().startsWith(prefix, ignoreCase = true)
        }
    }

    data class Contains(val substring: String) : MatchPattern() {
        override fun matches(message: String): Boolean {
            return message.contains(substring, ignoreCase = true)
        }
    }

    data class Regex(val pattern: String) : MatchPattern() {
        private val regex = kotlin.text.Regex(pattern, RegexOption.IGNORE_CASE)

        override fun matches(message: String): Boolean {
            return regex.containsMatchIn(message.trim())
        }
    }
}
