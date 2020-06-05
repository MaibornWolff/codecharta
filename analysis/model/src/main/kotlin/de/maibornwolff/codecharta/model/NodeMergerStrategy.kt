package de.maibornwolff.codecharta.model

interface NodeMergerStrategy {
    fun merge(tree: MutableNode, otherTrees: List<MutableNode>): MutableNode
}