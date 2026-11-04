package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

/**
 * Within [sharing], parsing a source again with the same grammar on the same thread hands out the tree of the first
 * parse, as long as that tree is not in use: ccsh analyse has three parsers read every file, and parsing is most of
 * what each spends on it. The trees are closed when [sharing] returns, so a scope holds the trees of one file.
 */
internal object SharedParses {
    fun <T> sharing(block: () -> T): T {
        if (FfmSyntaxTree.lenderOfThread.get() != null) return block()
        val scope = Scope()
        FfmSyntaxTree.lenderOfThread.set(scope)
        try {
            return block()
        } finally {
            FfmSyntaxTree.lenderOfThread.remove()
            scope.close()
        }
    }

    private class Scope : TreeLender<FfmSyntaxTree> {
        private val trees = ArrayList<SharedTree>()

        override fun lend(content: String, grammar: FfmGrammar, parse: () -> FfmSyntaxTree): FfmSyntaxTree {
            val shared = trees.firstOrNull { it.canServe(content, grammar) }
                ?: SharedTree(content, parse().apply { isShared = true }).also(trees::add)
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
