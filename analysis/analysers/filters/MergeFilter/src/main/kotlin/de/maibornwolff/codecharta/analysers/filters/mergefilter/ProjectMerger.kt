package de.maibornwolff.codecharta.analysers.filters.mergefilter

import com.google.gson.JsonElement
import de.maibornwolff.codecharta.model.BlacklistItem
import de.maibornwolff.codecharta.model.LensSet
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder

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

    // Opaque lenses are unioned by name; the first non-null commit hash wins. Their payload schema is
    // unknown, so two data-bearing payloads under the same name cannot be structurally combined: a genuine
    // collision fails loudly instead of silently dropping one side. An empty reserved slot (domain/security
    // `{}`) never conflicts and yields to a data-bearing payload so it still round-trips.
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

    private val mergedCommitHash: String? by lazy { projects.firstNotNullOfOrNull { it.commitHash } }

    // Each lens owns how its attribute types and descriptors combine; the merger only delegates.
    private val mergedMetricsLens by lazy { projects.map { it.lenses.metrics }.reduce { acc, lens -> acc.merge(lens) } }

    // Edges from every input are unioned and de-duplicated by endpoint pair, regardless of merge
    // strategy, so overlaying a dependency-bearing project never silently drops its edges.
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

// Whether an opaque JSON payload actually carries data. Empty objects/arrays and JSON null are the
// reserved-but-unused lens slots (e.g. domain/security `{}`); they reference nothing, merge trivially,
// and are safe to carry through a `--large` re-path unchanged.
internal fun JsonElement.carriesData(): Boolean = when {
    isJsonNull -> false
    isJsonObject -> asJsonObject.size() > 0
    isJsonArray -> asJsonArray.size() > 0
    else -> true
}
