package de.maibornwolff.codecharta.analysers.parsers.unified.gitignore

import java.nio.file.PathMatcher

/**
 * Represents a parsed gitignore pattern with its matching semantics.
 *
 * @property pattern The original gitignore pattern string
 * @property isNegation True if this is a negation pattern (starts with !)
 * @property isDirOnly True if this pattern only matches directories (ends with /)
 * @property isRooted True if this pattern is rooted (starts with / or has / in middle)
 * @property pathMatcher The compiled PathMatcher for efficient pattern matching
 * @property rootLevelMatcher Optional matcher for root-level files (for non-rooted patterns)
 * @property zeroDirectoryMatcher Optional matcher for when `/**/` matches zero directories (e.g., a/**/b → a/b)
 */
data class GitignoreRule(
    val pattern: String,
    val isNegation: Boolean,
    val isDirOnly: Boolean,
    val isRooted: Boolean,
    val pathMatcher: PathMatcher,
    val rootLevelMatcher: PathMatcher? = null,
    val zeroDirectoryMatcher: PathMatcher? = null
)
