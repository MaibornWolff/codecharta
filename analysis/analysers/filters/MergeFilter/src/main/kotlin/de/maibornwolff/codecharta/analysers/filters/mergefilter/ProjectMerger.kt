package de.maibornwolff.codecharta.analysers.filters.mergefilter

import com.google.gson.JsonElement
import de.maibornwolff.codecharta.model.BlacklistItem
import de.maibornwolff.codecharta.model.LensSet
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.model.mergeOpaqueLenses

class ProjectMerger(private val projects: List<Project>, private val nodeMerger: NodeMergerStrategy) {
    // Build straight from the merged typed lenses so an edge descriptor without a matching edge
    // attributeType is not re-routed into the metrics lens by the flat legacy projection.
    fun merge(): Project = when {
        areAllAPIVersionsCompatible() ->
            ProjectBuilder(nodes = mergeProjectNodes(), blacklist = mergeBlacklist())
                .withCommitHash(mergedCommitHash)
                .buildFromLenses(
                    LensSet(
                        metrics = mergedMetricsLens,
                        dependency = mergedDependencyLens,
                        opaqueLenses = mergedOpaqueLenses
                    )
                )

        else -> throw MergeException("API versions not supported.")
    }

    // Opaque lenses are unioned (keep-first on a name collision); the first non-null commit hash wins.
    private val mergedOpaqueLenses: Map<String, JsonElement> by lazy {
        projects.map { it.lenses.opaqueLenses }.reduce { acc, next -> mergeOpaqueLenses(acc, next) }
    }

    private val mergedCommitHash: String? by lazy { projects.firstNotNullOfOrNull { it.commitHash } }

    // Each lens owns how its attribute types and descriptors combine; the merger only delegates.
    private val mergedMetricsLens by lazy { projects.map { it.lenses.metrics }.reduce { acc, lens -> acc.merge(lens) } }

    // Edges from every input are unioned and de-duplicated by endpoint pair, regardless of merge
    // strategy, so overlaying a dependency-bearing project never silently drops its edges.
    private val mergedDependencyLens by lazy {
        projects.map { it.lenses.dependency }.reduce { acc, lens -> acc.merge(lens, mergeEdges = true) }
    }

    private fun areAllAPIVersionsCompatible(): Boolean {
        val unsupportedAPIVersions =
            projects
                .map {
                    it.apiVersion
                }.filter {
                    !Project.isAPIVersionCompatible(it)
                }

        return unsupportedAPIVersions.isEmpty()
    }

    private fun mergeProjectNodes(): List<MutableNode> {
        val mergedNodes =
            nodeMerger.mergeNodeLists(
                projects.map {
                    listOf(it.rootNode.toMutableNode())
                }
            )
        nodeMerger.logMergeStats()
        return mergedNodes
    }

    private fun mergeBlacklist(): MutableList<BlacklistItem> {
        val mergedBlacklist = mutableListOf<BlacklistItem>()
        projects.forEach { project ->
            project.blacklist.forEach {
                mergedBlacklist.add(it)
            }
        }
        return mergedBlacklist
            .distinctBy {
                it.toString()
            }.toMutableList()
    }
}
