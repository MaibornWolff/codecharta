package de.maibornwolff.codecharta.analysers.importers.dependacharta

import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.util.Logger

object DcJsonParser {
    private const val ROOT_PREFIX = "/root/"

    fun parseEdges(dcProject: DcProject): List<Edge> = dcProject.leaves.values
        .filter { it.physicalPath.isNotBlank() }
        .flatMap { leaf -> resolveDependencyPaths(leaf, dcProject.leaves) }
        .groupingBy { it }
        .eachCount()
        .map { (paths, count) ->
            Edge(ROOT_PREFIX + paths.first, ROOT_PREFIX + paths.second, mapOf("dependencies" to count))
        }

    private fun resolveDependencyPaths(leaf: DcLeaf, leaves: Map<String, DcLeaf>): List<Pair<String, String>> {
        return leaf.dependencies.keys.mapNotNull { targetId ->
            val targetPath = leaves[targetId]?.physicalPath
            if (targetPath == null) {
                Logger.warn { "Target leaf '$targetId' not found, skipping dependency" }
                return@mapNotNull null
            }
            if (targetPath.isBlank() || leaf.physicalPath == targetPath) return@mapNotNull null
            Pair(leaf.physicalPath, targetPath)
        }
    }
}
