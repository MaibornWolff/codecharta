package de.maibornwolff.codecharta.analysers.filters.mergefilter

import com.google.gson.JsonElement
import de.maibornwolff.codecharta.model.BlacklistItem
import de.maibornwolff.codecharta.model.DomainLens
import de.maibornwolff.codecharta.model.LensSet
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.model.carriesData

class ProjectMerger(private val projects: List<Project>, private val nodeMerger: NodeMergerStrategy) {
    fun merge(): Project = when {
        areAllAPIVersionsCompatible() ->
            ProjectBuilder(nodes = mergeProjectNodes(), blacklist = mergeBlacklist())
                .withCommitHash(mergedCommitHash)
                .buildFromLenses(
                    LensSet(
                        metrics = mergedMetricsLens,
                        dependency = mergedDependencyLens,
                        domain = mergedDomainLens,
                        opaqueLenses = mergedOpaqueLenses
                    )
                )

        else -> throw MergeException("API versions not supported.")
    }

    private val mergedOpaqueLenses: Map<String, JsonElement> by lazy {
        val merged = LinkedHashMap<String, JsonElement>()
        projects.forEach { project ->
            project.lenses.opaqueLenses.forEach { (lensName, payload) -> mergeOpaqueLens(merged, lensName, payload) }
        }
        merged
    }

    private fun mergeOpaqueLens(merged: LinkedHashMap<String, JsonElement>, lensName: String, payload: JsonElement) {
        val existing = merged[lensName]
        when {
            existing == null || existing == payload || !existing.carriesData() -> merged[lensName] = payload
            !payload.carriesData() -> Unit
            else -> throw MergeException(
                "Opaque lens '$lensName' has conflicting payloads across inputs and cannot be merged. " +
                    "Reconcile the inputs so this lens is identical or present in only one file, then retry."
            )
        }
    }

    private val mergedDomainLens: DomainLens? by lazy {
        projects.mapNotNull { it.lenses.domain }.reduceOrNull { merged, lens -> merged.merge(lens) }
    }

    private val mergedCommitHash: String? by lazy { projects.firstNotNullOfOrNull { it.commitHash } }

    private val mergedMetricsLens by lazy { projects.map { it.lenses.metrics }.reduce { acc, lens -> acc.merge(lens) } }

    private val mergedDependencyLens by lazy {
        projects.map { it.lenses.dependency }.reduce { acc, lens -> acc.merge(lens) }
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
