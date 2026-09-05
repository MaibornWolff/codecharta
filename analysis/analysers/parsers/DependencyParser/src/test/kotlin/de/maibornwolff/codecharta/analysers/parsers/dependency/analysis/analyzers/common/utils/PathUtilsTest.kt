package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.model.toImport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.File

class PathUtilsTest {
    @Test
    fun `should resolve relative import on same directory`() {
        // given
        val import = "./MyImport".toImport()
        val relativePath = Path("test/utils/PathUtilsTest.kt".split('/'))

        // when
        val resolvedPath = resolveRelativePath(import, relativePath)

        // then
        val expected = listOf("test", "utils", "MyImport")
        assertThat(resolvedPath.parts)
            .containsExactlyElementsOf(expected)
    }

    @Test
    fun `should resolve relative import on nested directory`() {
        // given
        val import = "../MyImport".toImport()
        val relativePath = Path("test/utils/PathUtilsTest.kt".split('/'))

        // when
        val resolvedPath = resolveRelativePath(import, relativePath)

        // then
        val expected = listOf("test", "MyImport")
        assertThat(resolvedPath.parts)
            .containsExactlyElementsOf(expected)
    }

    @Test
    fun `should convert absolute path to relative path using unix-style separators`() {
        // Given
        val analysisRoot = File("src/test/resources/rootdirectorywalker")
        val absolutePath = File(analysisRoot, "subdir/MyFile.java")

        // When
        val result = toRelativePath(absolutePath, analysisRoot)

        // Then
        assertThat(result.parts).containsExactly("subdir", "MyFile_java")
    }

    @Test
    fun `should strip extension when converting to relative path`() {
        // Given
        val analysisRoot = File("src/test/resources/rootdirectorywalker")
        val absolutePath = File(analysisRoot, "components/App.ts")

        // When
        val result = toRelativePath(absolutePath, analysisRoot, stripExtension = true)

        // Then
        assertThat(result.parts).containsExactly("components", "App")
    }

    @Test
    fun `should produce relative path for file in root`() {
        // Given
        val analysisRoot = File("src/test/resources/rootdirectorywalker")
        val absolutePath = File(analysisRoot, "Sample.java")

        // When
        val result = toRelativePath(absolutePath, analysisRoot)

        // Then
        assertThat(result.parts).containsExactly("Sample_java")
    }

    @Test
    fun `should strip vue extension when converting to relative path`() {
        // Given
        val analysisRoot = File("src/test/resources/rootdirectorywalker")
        val absolutePath = File(analysisRoot, "views/Home.vue")

        // When
        val result = toRelativePath(absolutePath, analysisRoot, stripExtension = true)

        // Then
        assertThat(result.parts).containsExactly("views", "Home")
    }

    @Test
    fun `should strip every source file extension regardless of case`() {
        // Act
        val stripped = listOf("a.ts", "b.MTS", "c.cts", "d.mjs", "e.cjs", "f.jsx", "g.vue", "h.css").map { it.stripSourceFileExtension() }

        // Assert
        assertThat(stripped).containsExactly("a", "b", "c", "d", "e", "f", "g", "h.css")
    }
}
