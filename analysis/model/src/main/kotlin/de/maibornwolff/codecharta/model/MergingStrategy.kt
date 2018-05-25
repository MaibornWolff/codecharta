package de.maibornwolff.codecharta.model

interface MergingStrategy<T> {
    fun merge(tree: Tree<T>, otherTrees: List<Tree<T>>) : Tree<T>
}

