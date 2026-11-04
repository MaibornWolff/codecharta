package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

/** Hands out a tree for a source and grammar, one it holds already or the one [parse] makes. */
internal fun interface TreeLender<T> {
    fun lend(content: String, grammar: FfmGrammar, parse: () -> T): T
}
