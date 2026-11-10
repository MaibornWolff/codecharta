package de.maibornwolff.codecharta.analysers.importers.sbom

import de.maibornwolff.codecharta.analysers.importers.sbom.cyclonedx.Bom
import de.maibornwolff.codecharta.analysers.importers.sbom.http.HttpGateway
import de.maibornwolff.codecharta.analysers.importers.sbom.lockfiles.Lockfile
import de.maibornwolff.codecharta.analysers.importers.sbom.lockfiles.LockfileLocator
import de.maibornwolff.codecharta.analysers.importers.sbom.packages.PackageCatalog
import de.maibornwolff.codecharta.analysers.importers.sbom.versions.DepsDevLookup
import de.maibornwolff.codecharta.analysers.importers.sbom.vulnerabilities.EmbeddedVulnerabilities
import de.maibornwolff.codecharta.analysers.importers.sbom.vulnerabilities.OsvLookup
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectBuilder
import de.maibornwolff.codecharta.model.SecurityLens
import de.maibornwolff.codecharta.model.SecurityNode
import de.maibornwolff.codecharta.model.SecurityPackage
import de.maibornwolff.codecharta.model.VersionsLookup
import java.io.File
import java.time.LocalDate

data class SbomImportResult(val project: Project, val hints: List<String>)

data class SbomLookups(val isOsvAsked: Boolean = false, val isDepsDevAsked: Boolean = false)

private data class VulnerabilityCheck(val packages: Map<String, SecurityPackage>, val isMeasured: Boolean, val sources: List<String>)

/**
 * Turns an SBOM into a project whose tree holds the lockfiles found in [projectFolder] and whose security lens holds
 * the packages. The online lookups run only when given; without them their fields stay unmeasured and a hint says so.
 */
class SbomImport(
    private val projectFolder: File,
    private val osvLookup: OsvLookup? = null,
    private val depsDevLookup: DepsDevLookup? = null,
    private val today: () -> LocalDate = LocalDate::now
) {
    private val hints = mutableListOf<String>()

    fun run(bom: Bom): SbomImportResult {
        val catalog = PackageCatalog.of(bom)
        if (catalog.packages.isEmpty()) hints += "The SBOM lists no packages."
        val vulnerabilityCheck = checkVulnerabilities(bom, catalog)
        val lookupDate = today()
        val packages = depsDevLookup?.let { addVersionLag(vulnerabilityCheck.packages, it, lookupDate) } ?: vulnerabilityCheck.packages
        if (depsDevLookup ==
            null
        ) {
            hints += "Dependency lag and outdated packages are not measured: run with --deps-dev to look up newer versions."
        }
        val lockfiles = LockfileLocator(projectFolder).locate(bom, catalog)
        reportMissingLockfiles(lockfiles.missing)
        val securityLens = SecurityLens(
            vulnerabilitySources = vulnerabilityCheck.sources.ifEmpty { null },
            vulnerabilitiesMeasured = vulnerabilityCheck.isMeasured.takeIf { it },
            versionsLookup = depsDevLookup?.let { VersionsLookup(DepsDevLookup.SOURCE, lookupDate.toString()) },
            packages = packages.ifEmpty { null },
            nodes = lockfiles.found.associate { NodeId.fromSegments(it.segments, NodeType.File) to toSecurityNode(it) }.ifEmpty { null }
        )
        return SbomImportResult(buildProject(lockfiles.found, securityLens), hints.toList())
    }

    private fun checkVulnerabilities(bom: Bom, catalog: PackageCatalog): VulnerabilityCheck {
        val embedded = EmbeddedVulnerabilities.byPackage(bom, catalog.keyByRef)
        val packages = catalog.packages.mapValues { (key, securityPackage) -> securityPackage.copy(vulnerabilities = embedded[key]) }
        val scanner = EmbeddedVulnerabilities.scannerOf(bom)
        if (scanner != null) {
            if (osvLookup != null) hints += "OSV lookup skipped: $scanner already checked every package."
            return VulnerabilityCheck(packages, true, listOf(scanner))
        }
        val embeddedSources = if (embedded.isEmpty()) emptyList() else bom.tools.map { it.label }
        if (osvLookup == null) {
            hints +=
                "Vulnerabilities are not measured: the SBOM names no vulnerability scanner. Create it with one (e.g. Trivy) or run with --osv."
            return VulnerabilityCheck(packages, false, embeddedSources)
        }
        return VulnerabilityCheck(addOsvFindings(packages, embedded.keys, osvLookup), true, embeddedSources + OsvLookup.SOURCE)
    }

    private fun addOsvFindings(
        packages: Map<String, SecurityPackage>,
        alreadyCovered: Set<String>,
        lookup: OsvLookup
    ): Map<String, SecurityPackage> {
        val result = lookup.check(packages.keys - alreadyCovered)
        if (result.unchecked.isNotEmpty()) {
            hints +=
                "OSV could not check ${countOf(result.unchecked.size, "package")}; they count as not measured."
        }
        return packages.mapValues { (key, securityPackage) ->
            val found = result.vulnerabilities[key]
            securityPackage.copy(
                vulnerabilities =
                    found?.let { (securityPackage.vulnerabilities.orEmpty() + it).distinctBy { vulnerability -> vulnerability.id } }
                        ?: securityPackage.vulnerabilities,
                vulnerabilitiesUnknown = if (key in result.unchecked) true else null
            )
        }
    }

    private fun addVersionLag(
        packages: Map<String, SecurityPackage>,
        lookup: DepsDevLookup,
        lookupDate: LocalDate
    ): Map<String, SecurityPackage> {
        val result = lookup.lookUp(packages, lookupDate)
        val unmeasured = result.unsupported.size + result.notFound.size + result.failed.size
        if (unmeasured > 0) {
            hints +=
                "deps.dev knew no versions of ${countOf(
                    unmeasured,
                    "package"
                )} (${result.unsupported.size} of an ecosystem it does not cover, " +
                "${result.notFound.size} unknown to it, ${result.failed.size} failed lookups); their lag is not measured."
        }
        return packages.mapValues { (key, securityPackage) ->
            val lag = result.lags[key] ?: return@mapValues securityPackage
            securityPackage.copy(
                newestVersion = lag.newestVersion,
                newerVersions = lag.newerVersions,
                daysOutdated = lag.daysOutdated,
                libyears = lag.libyears
            )
        }
    }

    private fun reportMissingLockfiles(missing: List<String>) {
        if (missing.isEmpty()) return
        val shown = missing.take(SHOWN_MISSING_LOCKFILES).joinToString(", ") + if (missing.size > SHOWN_MISSING_LOCKFILES) ", …" else ""
        hints +=
            "${countOf(
                missing.size,
                "lockfile"
            )} of the SBOM not found in ${projectFolder.path}, so their packages appear on no file: $shown"
    }

    private fun toSecurityNode(lockfile: Lockfile): SecurityNode =
        SecurityNode(declares = lockfile.declares.ifEmpty { null }, dependsOn = lockfile.dependsOn.ifEmpty { null })

    private fun buildProject(lockfiles: List<Lockfile>, securityLens: SecurityLens): Project {
        val builder = ProjectBuilder()
        lockfiles.forEach { builder.insertByPath(Path(it.segments.dropLast(1)), MutableNode(it.segments.last(), NodeType.File)) }
        return builder.withSecurityLens(securityLens).build()
    }

    private fun countOf(count: Int, noun: String): String = if (count == 1) "1 $noun" else "$count ${noun}s"

    companion object {
        private const val SHOWN_MISSING_LOCKFILES = 5

        /** An import that asks OSV.dev and deps.dev only when told to, both through one HTTP gateway made when first needed. */
        fun withLookups(
            projectFolder: File,
            lookups: SbomLookups,
            http: () -> HttpGateway,
            today: () -> LocalDate = LocalDate::now
        ): SbomImport {
            val gateway by lazy(http)
            return SbomImport(
                projectFolder = projectFolder,
                osvLookup = if (lookups.isOsvAsked) OsvLookup(gateway) else null,
                depsDevLookup = if (lookups.isDepsDevAsked) DepsDevLookup(gateway) else null,
                today = today
            )
        }
    }
}
