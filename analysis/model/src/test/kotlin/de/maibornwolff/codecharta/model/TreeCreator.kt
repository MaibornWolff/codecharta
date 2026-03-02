package de.maibornwolff.codecharta.model

object TreeCreator {
    @JvmOverloads
    fun createTree(pathToInnerTree: Path = Path.TRIVIAL, innerTree: Tree<MutableNode>? = null): Tree<MutableNode> =
        object : Tree<MutableNode>() {
            override val children: Set<Tree<MutableNode>>
                get() = if (innerTree == null) emptySet() else mutableSetOf(innerTree)

            override fun getPathOfChild(child: Tree<MutableNode>): Path = pathToInnerTree

            override fun toString(): String = pathToInnerTree.toString() + " -> " + innerTree

            override fun insertAt(path: Path, node: MutableNode): Unit = throw NotImplementedError()
        }
}
