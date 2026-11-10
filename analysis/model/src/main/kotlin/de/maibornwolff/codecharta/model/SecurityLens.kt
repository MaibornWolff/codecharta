package de.maibornwolff.codecharta.model

/**
 * The third-party packages a project ships, keyed by purl (or `name@version` without one), and which lockfile
 * declares which of them. [nodes] is keyed by node id, so a filter that re-paths the tree re-keys it, see [rekeyed].
 *
 * An absent field means "not measured": [vulnerabilitiesMeasured] says whether every package was checked for known
 * vulnerabilities (a package the check missed carries [SecurityPackage.vulnerabilitiesUnknown]); a package without
 * [SecurityPackage.newestVersion] had no version lookup.
 */
data class SecurityLens(
    val vulnerabilitySources: List<String>? = null,
    val vulnerabilitiesMeasured: Boolean? = null,
    val versionsLookup: VersionsLookup? = null,
    val packages: Map<String, SecurityPackage>? = null,
    val nodes: Map<String, SecurityNode>? = null
) : Lens {
    val carriesData: Boolean get() = !packages.isNullOrEmpty() || !nodes.isNullOrEmpty()

    fun merge(other: SecurityLens): SecurityLens {
        if (!carriesData) return other
        if (!other.carriesData) return this
        val ownPackages = packagesAfterMerge(other)
        val otherPackages = other.packagesAfterMerge(this)
        return SecurityLens(
            vulnerabilitySources = unionOrNull(vulnerabilitySources, other.vulnerabilitySources),
            vulnerabilitiesMeasured = if (isVulnerabilityMeasured || other.isVulnerabilityMeasured) true else null,
            versionsLookup = listOfNotNull(versionsLookup, other.versionsLookup).maxByOrNull { it.date },
            packages = mergeByKey(ownPackages, otherPackages) { _, existing, incoming -> existing.merge(incoming) }.toSortedMap(),
            nodes = mergeByKey(nodes.orEmpty(), other.nodes.orEmpty()) { _, existing, incoming -> existing.merge(incoming) }
        )
    }

    private val isVulnerabilityMeasured: Boolean get() = vulnerabilitiesMeasured == true

    // A merged lens counts as checked when one side was; the packages of the side that was not keep saying so themselves
    private fun packagesAfterMerge(other: SecurityLens): Map<String, SecurityPackage> {
        val ownPackages = packages.orEmpty()
        if (isVulnerabilityMeasured || !other.isVulnerabilityMeasured) return ownPackages
        return ownPackages.mapValues { (_, securityPackage) -> securityPackage.copy(vulnerabilitiesUnknown = true) }
    }

    /** Re-key the lockfile entries onto a restructured tree; packages are not keyed by node and stay as they are. */
    fun rekeyed(treeBeforeRestructuring: Node, treeAfterRestructuring: Node, remapSegments: SegmentRemapping): SecurityLens {
        if (nodes.isNullOrEmpty()) return this
        return copy(nodes = nodes.rekeyedBy(nodeIdRemapping(treeBeforeRestructuring, treeAfterRestructuring, remapSegments)))
    }
}

data class VersionsLookup(val source: String, val date: String)

data class SecurityPackage(
    val name: String,
    val version: String? = null,
    val ecosystem: String? = null,
    val dependsOn: List<String>? = null,
    val newestVersion: String? = null,
    val newerVersions: Int? = null,
    val daysOutdated: Int? = null,
    val libyears: Double? = null,
    val vulnerabilities: List<SecurityVulnerability>? = null,
    val vulnerabilitiesUnknown: Boolean? = null
) {
    fun merge(other: SecurityPackage): SecurityPackage {
        val withVersions = if (newestVersion != null || other.newestVersion == null) this else other
        val mergedVulnerabilities = (vulnerabilities.orEmpty() + other.vulnerabilities.orEmpty()).distinctBy { it.id }.sortedBy { it.id }
        return withVersions.copy(
            dependsOn = unionOrNull(dependsOn, other.dependsOn),
            vulnerabilities = mergedVulnerabilities.ifEmpty { null },
            vulnerabilitiesUnknown = if (vulnerabilitiesUnknown == true && other.vulnerabilitiesUnknown == true) true else null
        )
    }
}

data class SecurityVulnerability(
    val id: String,
    val severity: String,
    val score: Double? = null,
    val fixedVersions: List<String>? = null,
    val source: String? = null
)

data class SecurityNode(val declares: List<String>? = null, val dependsOn: List<String>? = null) {
    fun merge(other: SecurityNode): SecurityNode =
        SecurityNode(declares = unionOrNull(declares, other.declares), dependsOn = unionOrNull(dependsOn, other.dependsOn))
}

private fun unionOrNull(own: List<String>?, other: List<String>?): List<String>? =
    (own.orEmpty() + other.orEmpty()).distinct().sorted().ifEmpty { null }
