package de.maibornwolff.codecharta.ccsh

import de.maibornwolff.codecharta.analysers.importers.csv.CSVImporter
import de.maibornwolff.codecharta.analysers.parsers.rawtext.RawTextParser
import de.maibornwolff.codecharta.model.NodeId
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectToCcJsonV2Mapper
import de.maibornwolff.codecharta.serialization.dto.FileDto
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import picocli.CommandLine
import java.io.File
import kotlin.io.path.createTempDirectory

/**
 * The keystone guardrail for cc.json 2.0 mergeability: the same file at the same tree position must
 * get the same node `id` no matter which tool produced the file. This runs two genuinely different
 * producers (a parser and an importer) over the same logical path and asserts they both stamp the
 * canonical [NodeId]. A producer that re-roots, prefixes, or skips canonicalization would break the
 * merge/join property silently — this test fails loud instead.
 */
class CrossToolIdReproducibilityTest {
    @Test
    fun `the same file gets the same 2_0 id from a parser and an importer`() {
        // Arrange: the canonical id every tool must produce for the tree position src/App.kt.
        val expectedId = NodeId.fromSegments(listOf("src", "App.kt"))

        // A real source tree for the parser.
        val sourceDir = createTempDirectory("crosstool").toFile()
        File(sourceDir, "src").mkdirs()
        File(sourceDir, "src/App.kt").writeText("fun main() {\n    println(\"hi\")\n}\n")
        val parserOutput = newCcJsonFile()
        CommandLine(RawTextParser()).execute(sourceDir.absolutePath, "-o=${parserOutput.absolutePath}", "-nc")

        // A CSV referencing the same path for the importer.
        val csv = File.createTempFile("crosstool", ".csv").apply { deleteOnExit() }
        csv.writeText("path,rloc\nsrc/App.kt,3\n")
        val importerOutput = newCcJsonFile()
        CommandLine(CSVImporter()).execute(csv.absolutePath, "-o=${importerOutput.absolutePath}", "-nc", "--path-separator=/")

        // Act
        val parserId = idOfFileNamed(parserOutput, "App.kt")
        val importerId = idOfFileNamed(importerOutput, "App.kt")

        // Assert: both producers stamp the canonical id, so the file lines up across tools on merge.
        assertThat(parserId).isEqualTo(expectedId)
        assertThat(importerId).isEqualTo(expectedId)
    }

    private fun newCcJsonFile(): File = File.createTempFile("crosstool", ".cc.json").apply { deleteOnExit() }

    // Read back the id the canonical 2.0 serializer assigns to the producer's file tree, which
    // verifies the producer built the file at the expected tree position.
    private fun idOfFileNamed(producerOutput: File, name: String): String {
        val project = ProjectDeserializer.deserializeProject(producerOutput.readText())
        val rootFile = ProjectToCcJsonV2Mapper.toDto(project).files.first()
        return findId(rootFile, name) ?: error("no node named '$name' in ${producerOutput.name}")
    }

    private fun findId(node: FileDto, name: String): String? {
        if (node.name == name) return node.id
        node.children?.forEach { child -> findId(child, name)?.let { return it } }
        return null
    }
}
