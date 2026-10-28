package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_GLOBAL_SEGMENT
import de.maibornwolff.treesitter.excavationsite.api.UsedType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class GlobalUsesTest {
    @TempDir
    lateinit var analysisRoot: File

    private fun globalUse(name: String) = UsedType(name = name, namespacePrefix = listOf(TSE_GLOBAL_SEGMENT))

    @Test
    fun `should write a use of a global name as each global of that name`() {
        // Arrange
        File(analysisRoot, "a.d.ts").writeText("interface Registry { a: number }")
        File(analysisRoot, "b.d.ts").writeText("interface Registry { b: number }")

        // Act
        val written = GlobalUses.of(setOf(globalUse("Registry"), UsedType("Model")), analysisRoot)

        // Assert
        assertThat(written.map { it.name }).containsExactlyInAnyOrder("a_d.Registry", "b_d.Registry", "Model")
    }

    @Test
    fun `should keep a free upper-case name that no global declares as written and drop a lower-case one`() {
        // Arrange
        val uses = setOf(globalUse("Shape"), globalUse("console"))

        // Act
        val written = GlobalUses.of(uses, analysisRoot)

        // Assert
        assertThat(written.map { it.name to it.namespacePrefix }).containsExactly("Shape" to emptyList<String>())
    }
}
