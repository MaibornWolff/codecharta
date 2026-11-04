package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

/**
 * Within [sharing], parsing a source again with the same grammar on the same thread hands out the tree of the first
 * parse, as long as that tree is not in use: ccsh analyse has three parsers read every file, and parsing is most of
 * what each spends on it. The trees are closed when [sharing] returns, so a scope holds the trees of one file.
 */
internal object SharedParses {
    private val scopeOfThread = ThreadLocal<Scope>()

    fun <T> sharing(block: () -> T): T {
        if (scopeOfThread.get() != null) return block()
        val scope = Scope()
        scopeOfThread.set(scope)
        try {
            return block()
        } finally {
            scopeOfThread.remove()
            scope.close()
        }
    }

    fun parse(content: String, grammar: FfmGrammar, parseTree: () -> FfmSyntaxTree): FfmSyntaxTree {
        val scope = scopeOfThread.get() ?: return parseTree()
        return scope.lease(content, grammar, parseTree)
    }

    private class Scope {
        private val trees = ArrayList<SharedTree>()

        fun lease(content: String, grammar: FfmGrammar, parseTree: () -> FfmSyntaxTree): FfmSyntaxTree {
            val shared = trees.firstOrNull { it.canServe(content, grammar) }
                ?: SharedTree(content, parseTree().apply { isShared = true }).also(trees::add)
            return shared.tree.apply { lease() }
        }

        fun close() {
            trees.forEach { it.tree.closeTree() }
        }
    }

    private class SharedTree(private val content: String, val tree: FfmSyntaxTree) {
        fun canServe(content: String, grammar: FfmGrammar): Boolean = !tree.isLeased && tree.grammar === grammar && this.content == content
    }
}
