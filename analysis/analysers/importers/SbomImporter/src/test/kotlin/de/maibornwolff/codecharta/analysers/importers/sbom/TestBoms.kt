package de.maibornwolff.codecharta.analysers.importers.sbom

import de.maibornwolff.codecharta.analysers.importers.sbom.cyclonedx.Bom
import de.maibornwolff.codecharta.analysers.importers.sbom.cyclonedx.CycloneDxReader
import java.io.File

object TestBoms {
    const val EXPRESS = "pkg:npm/express@4.17.1"
    const val QS = "pkg:npm/qs@6.5.2"
    const val ROUTER = "pkg:npm/%40acme/router@2.0.0"

    fun trivy(): Bom = read("trivy_sample.cdx.json")

    fun cdxgen(): Bom = read("cdxgen_sample.cdx.json")

    private fun read(name: String): Bom = File("src/test/resources/$name").bufferedReader().use { CycloneDxReader.read(it) }

    /** A project folder holding the given files, so the lockfile search finds them. */
    fun projectFolderWith(root: File, vararg paths: String): File {
        paths.forEach { path -> File(root, path).apply { parentFile.mkdirs() }.writeText("{}") }
        return root
    }
}
