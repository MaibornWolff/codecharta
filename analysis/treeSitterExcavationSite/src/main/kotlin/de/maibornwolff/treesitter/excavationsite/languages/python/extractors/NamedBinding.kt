package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

/**
 * A name a statement binds, from the byte [position] on; a wildcard import binds no single name. [branches] are the
 * branches of `if` and `try` statements the statement lies in, the outermost first.
 */
internal data class NamedBinding(val name: String?, val binding: Binding, val position: Int, val branches: List<Branch> = emptyList()) {
    /** Whether only the run decides between this binding and [other], as they lie in different branches of one statement. */
    fun isAlternativeTo(other: NamedBinding): Boolean {
        val (mine, theirs) = branches.zip(other.branches).firstOrNull { (mine, theirs) -> mine != theirs } ?: return false
        return mine.statement == theirs.statement && mine.isAlternative && theirs.isAlternative
    }
}

/** The branch [branch] of the `if` or `try` statement at [statement]; a part that always runs is no alternative. */
internal data class Branch(val statement: Int, val branch: Int) {
    val isAlternative: Boolean get() = branch != ALWAYS_RUNS

    companion object {
        const val ALWAYS_RUNS = -1
    }
}

/** The last of the bindings named [name] and the earlier ones that are alternatives to it, the latest first. */
internal fun List<NamedBinding>.lastWithAlternatives(name: String): List<NamedBinding> {
    val latestFirst = filter { it.name == name }.asReversed()
    val alternativeCount = latestFirst.indices
        .takeWhile { index ->
            latestFirst.take(index).all { it.isAlternativeTo(latestFirst[index]) }
        }.size
    return latestFirst.take(alternativeCount)
}
