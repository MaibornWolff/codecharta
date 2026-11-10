package de.maibornwolff.codecharta.analysers.importers.sbom.lockfiles

import de.maibornwolff.codecharta.analysers.importers.sbom.cyclonedx.Bom
import de.maibornwolff.codecharta.analysers.importers.sbom.packages.PackageCatalog
import java.io.File

data class Lockfile(val segments: List<String>, val declares: List<String>, val dependsOn: List<String>)

data class LockfileSearch(val found: List<Lockfile>, val missing: List<String>)

/**
 * Finds the lockfiles an SBOM was made from inside [projectFolder]. Trivy writes one purl-less `application`
 * component per lockfile, named by its path; cdxgen and Syft name the file on each package instead. A path is
 * tried as written, then with its leading folders dropped one by one, since a scan may have started above the
 * project folder.
 */
class LockfileLocator(private val projectFolder: File) {
    fun locate(bom: Bom, catalog: PackageCatalog): LockfileSearch {
        val candidates = lockfilesOfSources(bom, catalog) + lockfilesOfPackageProperties(bom, catalog)
        val resolved = candidates.map { (path, lockfile) -> path to resolve(path)?.let { lockfile.copy(segments = it) } }
        val found = resolved.mapNotNull { it.second }.groupBy { it.segments }.map { (_, sameFile) -> sameFile.reduce(::union) }
        val missing = resolved.filter { it.second == null }.map { it.first }.distinct().sorted()
        return LockfileSearch(found.sortedBy { it.segments.joinToString("/") }, missing)
    }

    private fun lockfilesOfSources(bom: Bom, catalog: PackageCatalog): List<Pair<String, Lockfile>> = catalog.sources.map { source ->
        val startRefs = bom.dependsOn[source.ref].orEmpty()
        val directRefs = directPackageRefs(bom, startRefs, catalog)
        source.name to Lockfile(emptyList(), keysOf(reachableRefs(bom, startRefs), catalog), keysOf(directRefs, catalog))
    }

    private fun lockfilesOfPackageProperties(bom: Bom, catalog: PackageCatalog): List<Pair<String, Lockfile>> {
        val directKeys = keysOf(directPackageRefs(bom, bom.rootRef?.let { bom.dependsOn[it] }.orEmpty(), catalog), catalog).toSet()
        return bom.components
            .mapNotNull { component -> sourceFileOf(component.properties)?.let { it to catalog.keyByRef[component.ref] } }
            .filter { it.second != null }
            .groupBy({ it.first }, { it.second!! })
            .map { (path, keys) ->
                path to
                    Lockfile(emptyList(), keys.distinct().sorted(), keys.filter { it in directKeys }.distinct().sorted())
            }
    }

    private fun sourceFileOf(properties: Map<String, String>): String? = SOURCE_FILE_PROPERTIES.firstNotNullOfOrNull { properties[it] }

    // The project's own modules are no packages, so the packages they depend on count as direct ones
    private fun directPackageRefs(bom: Bom, startRefs: List<String>, catalog: PackageCatalog): List<String> {
        val direct = mutableListOf<String>()
        val visited = HashSet<String>()
        val pending = ArrayDeque(startRefs)
        while (pending.isNotEmpty()) {
            val ref = pending.removeFirst()
            if (!visited.add(ref)) continue
            if (ref in catalog.keyByRef) direct += ref else pending.addAll(bom.dependsOn[ref].orEmpty())
        }
        return direct
    }

    private fun reachableRefs(bom: Bom, startRefs: List<String>): Set<String> {
        val reached = LinkedHashSet<String>()
        val pending = ArrayDeque(startRefs)
        while (pending.isNotEmpty()) {
            val ref = pending.removeFirst()
            if (reached.add(ref)) pending.addAll(bom.dependsOn[ref].orEmpty())
        }
        return reached
    }

    private fun keysOf(refs: Collection<String>, catalog: PackageCatalog): List<String> = refs
        .mapNotNull {
            catalog.keyByRef[it]
        }.distinct()
        .sorted()

    private fun union(first: Lockfile, second: Lockfile): Lockfile = Lockfile(
        first.segments,
        (first.declares + second.declares).distinct().sorted(),
        (first.dependsOn + second.dependsOn).distinct().sorted()
    )

    internal fun resolve(path: String): List<String>? {
        val segments = relativeSegments(path)
        return segments.indices
            .map { segments.drop(it) }
            .firstOrNull { it.isNotEmpty() && File(projectFolder, it.joinToString(File.separator)).isFile }
    }

    private fun relativeSegments(path: String): List<String> {
        val normalized = path.replace('\\', '/')
        val absoluteProject = projectFolder.absoluteFile
            .normalize()
            .path
            .replace('\\', '/')
            .trimEnd('/') + "/"
        val relative = if (normalized.startsWith(absoluteProject)) normalized.removePrefix(absoluteProject) else normalized
        return relative.split('/').filter { it.isNotEmpty() && it != "." }
    }

    companion object {
        private val SOURCE_FILE_PROPERTIES = listOf("SrcFile", "syft:location:0:path", "aquasecurity:trivy:FilePath")
    }
}
