package de.maibornwolff.codecharta.analysers.parsers.svnlog.converter

import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.Commit
import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.Modification
import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.VersionControlledFile
import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.metrics.MetricsFactory
import io.mockk.every
import io.mockk.mockk
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.OffsetDateTime

class ProjectConverterTest {
    private val metricsFactory = mockk<MetricsFactory>()

    @BeforeEach
    fun setup() {
        every { metricsFactory.createMetrics() } returns listOf()
    }

    private fun modificationsByFilename(vararg filenames: String): List<Modification> {
        return filenames.map { Modification(it) }
    }

    @Test
    @Throws(Exception::class)
    fun `can create an empty project`() { // given
        val projectConverter = ProjectConverter(true)

        // when
        val project = projectConverter.convert(emptyList(), metricsFactory)

        // then
        assertThat(project.rootNode.leaves).hasSize(1)
    }

    @Test
    fun `can convert project with authors`() { // given
        val projectConverter = ProjectConverter(true)
        val file1 = VersionControlledFile("File 1", metricsFactory)
        file1.registerCommit(Commit("Author", modificationsByFilename("File 1", "File 2"), OffsetDateTime.now()))

        // when
        val project = projectConverter.convert(listOf(file1), metricsFactory)

        // then
        assertThat(project.rootNode.children.toMutableList()[0].attributes.containsKey("authors")).isTrue()
    }

    @Test
    fun `can convert project without authors`() { // given
        val projectConverter = ProjectConverter(false)
        val file1 = VersionControlledFile("File 1", metricsFactory)
        file1.registerCommit(Commit("Author", modificationsByFilename("File 1", "File 2"), OffsetDateTime.now()))

        // when
        val project = projectConverter.convert(listOf(file1), metricsFactory)

        // then
        assertThat(project.rootNode.children.toMutableList()[0].attributes.containsKey("authors")).isFalse()
    }

    @Test
    fun `edges are registered in project`() { // given
        val projectConverter = ProjectConverter(true)
        val metricsFactory = MetricsFactory().createMetrics()
        val file1 = VersionControlledFile("File 1", metricsFactory)
        val commit = Commit("Author", modificationsByFilename("File 1", "File 2"), OffsetDateTime.now())
        for (i in 0..4) {
            file1.registerCommit(commit)
        }

        // when
        val project = projectConverter.convert(listOf(file1), MetricsFactory())

        // then
        assertThat(project.edges.size).isEqualTo(1)
        assertThat(project.edges[0].toNodeName).isEqualTo("/root/File 2")
        assertThat(project.edges[0].fromNodeName).isEqualTo("/root/File 1")
    }

    @Test
    fun attributeTypesAreCreated() {
        val projectConverter = ProjectConverter(false)
        val project = projectConverter.convert(listOf(), MetricsFactory())

        assertThat(project.attributeTypes).containsKeys("edges", "nodes")
    }
}
