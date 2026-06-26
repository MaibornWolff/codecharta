package de.maibornwolff.codecharta.analysers.filters.mergefilter

import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.BlacklistItem
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.LensSet
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.util.Logger

class ProjectMerger(private val projects: List<Project>, private val nodeMerger: NodeMergerStrategy) {
    fun merge(): Project = when {
        areAllAPIVersionsCompatible() ->
            ProjectBuilder(
                mergeProjectNodes(),
                mergeEdges(),
                mergeAttributeTypes(),
                mergeAttributeDescriptors(),
                mergeBlacklist()
            ).build()

        else -> throw MergeException("API versions not supported.")
    }

    // Each lens owns how its attribute types and descriptors combine; the merger only delegates.
    private val mergedMetricsLens by lazy { projects.map { it.lenses.metrics }.reduce { acc, lens -> acc.merge(lens) } }
    private val mergedDependencyLens by lazy {
        projects.map { it.lenses.dependency }.reduce { acc, lens -> acc.merge(lens, mergeEdges = nodeMerger.mergesEdges) }
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

    // The dependency lens already merges/dedupes (or keeps) edges per the strategy, so read its
    // result instead of re-deriving the dedup here.
    private fun mergeEdges(): MutableList<Edge> {
        if (!nodeMerger.mergesEdges) warnIfEdgesDiscarded()
        return mergedDependencyLens.edges.toMutableList()
    }

    private fun warnIfEdgesDiscarded() {
        projects.forEachIndexed { i, project ->
            if (i > 0 && project.lenses.dependency.edges.isNotEmpty()) {
                Logger.warn {
                    "Edges were not merged. Use recursive strategy to merge edges."
                }
            }
        }
    }

    private fun mergeAttributeTypes(): MutableMap<String, MutableMap<String, AttributeType>> {
        val mergedAttributeTypes: MutableMap<String, MutableMap<String, AttributeType>> = mutableMapOf()
        if (mergedMetricsLens.attributeTypes.isNotEmpty()) {
            mergedAttributeTypes[LensSet.NODES_KEY] = mergedMetricsLens.attributeTypes.toMutableMap()
        }
        if (mergedDependencyLens.attributeTypes.isNotEmpty()) {
            mergedAttributeTypes[LensSet.EDGES_KEY] = mergedDependencyLens.attributeTypes.toMutableMap()
        }
        return mergedAttributeTypes
    }

    private fun mergeAttributeDescriptors(): MutableMap<String, AttributeDescriptor> =
        (mergedMetricsLens.attributeDescriptors + mergedDependencyLens.attributeDescriptors).toMutableMap()

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
