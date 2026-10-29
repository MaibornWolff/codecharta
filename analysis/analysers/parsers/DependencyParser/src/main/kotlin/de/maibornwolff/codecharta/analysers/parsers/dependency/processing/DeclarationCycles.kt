package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.CycleAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.NodeInformation

/** A declaration as the cycle search tells it apart: the file that declares it and its logical path. */
internal data class DeclarationKey(val file: FilePath, val logicalPath: String) {
    companion object {
        fun of(node: Node) = DeclarationKey(FilePath.of(node), node.pathWithName.withDots())
    }
}

/**
 * The cycles between declarations, found on the edges that are drawn: declarations that share a logical path in
 * different files stay apart, while an implementation part is one declaration with the declaration of its path, so a
 * cycle can enter a type through one part and leave it through another, along the `part_of` edge between them.
 */
internal class DeclarationCycles private constructor(
    private val cyclicTargetsByDeclaration: Map<DeclarationKey, Set<DeclarationKey>>,
    private val declarationOfPart: Map<DeclarationKey, DeclarationKey>,
    private val partsOnCyclesByDeclaration: Map<DeclarationKey, Set<DeclarationKey>>
) {
    fun isCyclic(source: DeclarationKey, target: DeclarationKey): Boolean {
        if (source.logicalPath == target.logicalPath) return isPartOfEdgeOnCycle(source)
        return declarationOf(target) in cyclicTargetsByDeclaration[declarationOf(source)].orEmpty()
    }

    private fun isPartOfEdgeOnCycle(part: DeclarationKey): Boolean {
        val partsOnCycles = partsOnCyclesByDeclaration[declarationOf(part)].orEmpty()
        return part in partsOnCycles && partsOnCycles.size > 1
    }

    private fun declarationOf(key: DeclarationKey): DeclarationKey = declarationOfPart[key] ?: key

    companion object {
        val NONE = DeclarationCycles(emptyMap(), emptyMap(), emptyMap())

        fun of(resolvedNodes: Collection<Node>, declaringFiles: DeclaringFiles): DeclarationCycles {
            val declarationOfPart = resolvedNodes
                .filter { it.isImplementationPart }
                .mapNotNull { part -> declarationImplementedBy(part, declaringFiles)?.let { DeclarationKey.of(part) to it } }
                .toMap()

            fun declarationOf(key: DeclarationKey) = declarationOfPart[key] ?: key
            val edges = edgesBetweenDeclarations(resolvedNodes, declaringFiles)
            val cyclicTargets = cyclicTargetsOf(edges.map { (source, target) -> declarationOf(source) to declarationOf(target) })
            val partsOnCycles = edges
                .filter { (source, target) -> declarationOf(target) in cyclicTargets[declarationOf(source)].orEmpty() }
                .flatMap { it.toList() }
                .groupBy { declarationOf(it) }
                .mapValues { (_, parts) -> parts.toSet() }
            return DeclarationCycles(cyclicTargets, declarationOfPart, partsOnCycles)
        }

        private fun declarationImplementedBy(part: Node, declaringFiles: DeclaringFiles): DeclarationKey? {
            val partKey = DeclarationKey.of(part)
            return declaringFiles
                .filesFor(partKey.logicalPath, partKey.file, part.language)
                .firstOrNull { it != partKey.file }
                ?.let { DeclarationKey(it, partKey.logicalPath) }
        }

        // The edges the projections draw, but for an implementation part's own edge to its declaration
        private fun edgesBetweenDeclarations(
            resolvedNodes: Collection<Node>,
            declaringFiles: DeclaringFiles
        ): List<Pair<DeclarationKey, DeclarationKey>> = resolvedNodes
            .flatMap { node ->
                val source = DeclarationKey.of(node)
                node.resolvedNodeDependencies.internalDependencies
                    .filter { it.withDots() != source.logicalPath }
                    .flatMap { dependency ->
                        declaringFiles
                            .filesFor(dependency.withDots(), source.file, node.language, dependency.kinds)
                            .map { targetFile -> source to DeclarationKey(targetFile, dependency.withDots()) }
                    }
            }.distinct()

        private fun cyclicTargetsOf(edges: List<Pair<DeclarationKey, DeclarationKey>>): Map<DeclarationKey, Set<DeclarationKey>> {
            val nodeInformation = edges
                .filter { (source, target) -> source != target }
                .groupBy({ it.first }, { it.second })
                .map { (source, targets) -> NodeInformation(source, targets.toSet()) }
                .toSet()
            return CycleAnalyzer.cyclicTargetsByNode(nodeInformation)
        }
    }
}
