package de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics

object SemanticCommitDetector {
    private fun startsWithIgnoreCase(message: String, prefix: String): Boolean {
        return message.trim().startsWith(prefix, ignoreCase = true)
    }

    fun isFeatCommit(message: String): Boolean {
        return startsWithIgnoreCase(message, "feat")
    }

    fun isFixCommit(message: String): Boolean {
        return startsWithIgnoreCase(message, "fix")
    }

    fun isDocsCommit(message: String): Boolean {
        return startsWithIgnoreCase(message, "docs")
    }

    fun isStyleCommit(message: String): Boolean {
        return startsWithIgnoreCase(message, "style")
    }

    fun isRefactorCommit(message: String): Boolean {
        return startsWithIgnoreCase(message, "refactor")
    }

    fun isTestCommit(message: String): Boolean {
        return startsWithIgnoreCase(message, "test")
    }

    fun isHotfixCommit(message: String): Boolean {
        return message.contains("hotfix", ignoreCase = true)
    }

    fun isSemanticCommit(message: String): Boolean {
        return isFeatCommit(message) ||
            isFixCommit(message) ||
            isDocsCommit(message) ||
            isStyleCommit(message) ||
            isRefactorCommit(message) ||
            isTestCommit(message)
    }
}
