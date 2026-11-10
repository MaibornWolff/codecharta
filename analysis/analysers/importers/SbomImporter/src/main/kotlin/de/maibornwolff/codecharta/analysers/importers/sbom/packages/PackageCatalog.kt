package de.maibornwolff.codecharta.analysers.importers.sbom.packages

import de.maibornwolff.codecharta.analysers.importers.sbom.cyclonedx.Bom
import de.maibornwolff.codecharta.analysers.importers.sbom.cyclonedx.BomComponent
import de.maibornwolff.codecharta.model.SecurityPackage

/**
 * The packages of an SBOM, one per purl however many lockfiles list it, and the purl-less `application`
 * components scanners such as Trivy write for each lockfile they read ([sources]). A component without a version is
 * the project's own module (a Go main module, a workspace package), not a dependency, so it is neither.
 */
class PackageCatalog private constructor(
    val packages: Map<String, SecurityPackage>,
    val keyByRef: Map<String, String>,
    val sources: List<BomComponent>
) {
    companion object {
        private const val APPLICATION = "application"

        fun of(bom: Bom): PackageCatalog {
            val (sources, packageComponents) = bom.components
                .filter { it.ref != bom.rootRef && !isOwnModule(it) }
                .partition(::isSource)
            val keyByRef = packageComponents.associate { it.ref to keyOf(it) }
            val dependsOnByKey = dependsOnByKey(bom, keyByRef)
            val packages = packageComponents
                .groupBy { keyOf(it) }
                .mapValues { (key, components) -> toPackage(components.first(), dependsOnByKey[key]) }
                .toSortedMap()
            return PackageCatalog(packages, keyByRef, sources)
        }

        private fun isSource(component: BomComponent): Boolean = component.type == APPLICATION && component.purl == null

        private fun isOwnModule(component: BomComponent): Boolean =
            !isSource(component) && component.version == null && component.purl?.let { Purl.parse(it)?.version } == null

        fun keyOf(component: BomComponent): String =
            component.purl?.let { Purl.parse(it) }?.key ?: "${plainName(component)}@${component.version.orEmpty()}"

        private fun plainName(component: BomComponent): String = listOfNotNull(component.group, component.name).joinToString("/")

        private fun toPackage(component: BomComponent, dependsOn: List<String>?): SecurityPackage {
            val purl = component.purl?.let { Purl.parse(it) }
            return SecurityPackage(
                name = purl?.packageName ?: plainName(component),
                version = purl?.version ?: component.version,
                ecosystem = purl?.type,
                dependsOn = dependsOn
            )
        }

        private fun dependsOnByKey(bom: Bom, keyByRef: Map<String, String>): Map<String, List<String>> = keyByRef.entries
            .groupBy({ it.value }, { it.key })
            .mapValues { (key, refs) ->
                refs
                    .flatMap { bom.dependsOn[it].orEmpty() }
                    .mapNotNull { keyByRef[it] }
                    .filter { it != key }
                    .distinct()
                    .sorted()
            }.filterValues { it.isNotEmpty() }
    }
}
