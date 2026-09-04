package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.extractFrom
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

/**
 * Drives the whole processing chain over the "cellars and centaurs" sample, the same one the extraction
 * contract tests use. The Java version of the sample carries a layering violation and a cycle, so it
 * exercises every edge type the lens can carry.
 */
class ProcessingPipelineTest {
    private val javaSample = "src/test/resources/analysis/contract/examples/java"

    private fun graphOfJavaSample(omitGraphAnalysis: Boolean = false): DependencyGraph =
        ProcessingPipeline.run(extractFrom(javaSample, SupportedLanguage.JAVA), omitGraphAnalysis)

    @Test
    fun `should produce file-to-file edges addressed by path segments`() {
        // Act
        val graph = graphOfJavaSample()

        // Assert
        assertThat(graph.edges).isNotEmpty
        assertThat(graph.edges).allSatisfy { edge ->
            assertThat(edge.fromPath.last()).endsWith(".java")
            assertThat(edge.toPath.last()).endsWith(".java")
            assertThat(edge.fromPath).isNotEqualTo(edge.toPath)
        }
    }

    @Test
    fun `should give every edge a weight of at least one`() {
        // Act
        val graph = graphOfJavaSample()

        // Assert
        assertThat(graph.edges).allSatisfy { edge -> assertThat(edge.weight).isGreaterThanOrEqualTo(1) }
    }

    @Test
    fun `should find cyclic edges in a sample that contains a cycle`() {
        // Act
        val graph = graphOfJavaSample()

        // Assert
        assertThat(graph.edges.filter { it.isCyclic }).isNotEmpty
    }

    @Test
    fun `should find upward-pointing edges in a sample that violates its layering`() {
        // Act
        val graph = graphOfJavaSample()

        // Assert
        assertThat(graph.edges.filter { it.isPointingUpwards }).isNotEmpty
    }

    @Test
    fun `should assign a level to every file and to every folder above it`() {
        // Act
        val graph = graphOfJavaSample()

        // Assert
        assertThat(graph.levels).isNotEmpty
        assertThat(graph.levels).allSatisfy { levelized -> assertThat(levelized.level).isGreaterThanOrEqualTo(0) }
        assertThat(graph.levels.filter { it.isFile }).isNotEmpty
        assertThat(graph.levels.filter { !it.isFile }).isNotEmpty
    }

    @Test
    fun `should level a file that depends on nothing at zero`() {
        // Act
        val graph = graphOfJavaSample()
        val filesWithoutOutgoingEdges =
            graph.levels.filter { it.isFile && graph.edges.none { edge -> edge.fromPath == it.path } }

        // Assert
        assertThat(filesWithoutOutgoingEdges).isNotEmpty
        assertThat(filesWithoutOutgoingEdges).allSatisfy { levelized -> assertThat(levelized.level).isEqualTo(0) }
    }

    @Test
    fun `should keep the dependencies but skip cycles and levels when graph analysis is omitted`() {
        // Act
        val graph = graphOfJavaSample(omitGraphAnalysis = true)

        // Assert
        assertThat(graph.edges).isNotEmpty
        assertThat(graph.edges).allSatisfy { edge ->
            assertThat(edge.isCyclic).isFalse()
            assertThat(edge.isPointingUpwards).isFalse()
        }
        assertThat(graph.levels).isEmpty()
    }

    @Test
    fun `should produce an empty graph when nothing was extracted`() {
        // Act
        val graph = ProcessingPipeline.run(emptyList(), omitGraphAnalysis = false)

        // Assert
        assertThat(graph.edges).isEmpty()
        assertThat(graph.levels).isEmpty()
    }

    @Test
    fun `should produce an empty graph when every file report is empty`() {
        // Act
        val graph = ProcessingPipeline.run(listOf(FileReport(emptyList())), omitGraphAnalysis = false)

        // Assert
        assertThat(graph.edges).isEmpty()
        assertThat(graph.levels).isEmpty()
    }

    @Test
    fun `should be deterministic across runs`() {
        // Arrange: levels and cycles both drive rendering, so a rerun must not shuffle them.
        val first = graphOfJavaSample()

        // Act
        val second = graphOfJavaSample()

        // Assert
        assertThat(second.edges).isEqualTo(first.edges)
        assertThat(second.levels).isEqualTo(first.levels)
    }
}
