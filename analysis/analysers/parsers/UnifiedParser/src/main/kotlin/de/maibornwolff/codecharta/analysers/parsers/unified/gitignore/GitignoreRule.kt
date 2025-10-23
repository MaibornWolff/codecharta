package de.maibornwolff.codecharta.analysers.parsers.unified.gitignore

import java.nio.file.PathMatcher

data class GitignoreRule(
    val pattern: String,
    val isNegation: Boolean,
    val isDirOnly: Boolean,
    val isRooted: Boolean,
    val pathMatcher: PathMatcher,
    val rootLevelMatcher: PathMatcher? = null,
    val collapsedGlobstarMatcher: PathMatcher? = null
)
