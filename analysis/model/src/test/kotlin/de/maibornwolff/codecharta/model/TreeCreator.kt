package de.maibornwolff.codecharta.model

object TreeCreator {

    @JvmOverloads
    fun createTree(pathToInnerTree: Path = Path.TRIVIAL, innerTree: Tree<*>? = null): Tree<MutableNode> {
        return object: Tree<MutableNode>() {
            override val children: List<Tree<MutableNode>>
                get() = if (innerTree == null) emptyList() else mutableListOf(innerTree as Tree<MutableNode>)

            override fun getPathOfChild(child: Tree<MutableNode>): Path {
                return pathToInnerTree
            }

            override fun toString(): String {
                return pathToInnerTree.toString() + " -> " + innerTree
            }

            override fun insertAt(path: Path, node: MutableNode) {
                throw NotImplementedError()
            }
        }
    }
}
