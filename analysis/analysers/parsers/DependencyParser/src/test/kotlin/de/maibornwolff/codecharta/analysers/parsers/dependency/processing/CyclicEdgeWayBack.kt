package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.TypeOfUsage

/**
 * The cyclic declaration edges a reader cannot follow back: no chain of cyclic edges leads from the target to the
 * source, with a `part_of` edge walked both ways, as the parts of one type are one declaration to the cycle search.
 */
internal fun DependencyGraph.cyclicEdgesWithoutWayBack(): List<DeclarationEdge> {
    val cyclicEdges = declarationEdges.filter { it.isCyclic }
    val successors = HashMap<DeclarationAddress, MutableSet<DeclarationAddress>>()
    cyclicEdges.forEach { edge ->
        successors.getOrPut(edge.from) { mutableSetOf() }.add(edge.to)
        if (TypeOfUsage.PART_OF.rawValue in edge.usage) successors.getOrPut(edge.to) { mutableSetOf() }.add(edge.from)
    }
    return cyclicEdges.filterNot { edge -> reaches(edge.to, edge.from, successors) }
}

private fun reaches(
    start: DeclarationAddress,
    goal: DeclarationAddress,
    successors: Map<DeclarationAddress, Set<DeclarationAddress>>
): Boolean {
    val visited = mutableSetOf(start)
    val pending = ArrayDeque(listOf(start))
    while (pending.isNotEmpty()) {
        val current = pending.removeFirst()
        if (current == goal) return true
        successors[current].orEmpty().filter { visited.add(it) }.forEach { pending.addLast(it) }
    }
    return false
}
