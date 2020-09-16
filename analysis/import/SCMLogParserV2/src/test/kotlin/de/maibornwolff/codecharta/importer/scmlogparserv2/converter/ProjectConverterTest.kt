package de.maibornwolff.codecharta.importer.scmlogparserv2.converter

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Modification
import de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics.MetricsFactory
import io.mockk.every
import io.mockk.mockk
import org.junit.Before

class ProjectConverterTest {

    private val metricsFactory = mockk<MetricsFactory>()

    @Before
    fun setup() {
        every { metricsFactory.createMetrics() } returns listOf()
    }

    private fun modificationsByFilename(vararg filenames: String): List<Modification> {
        return filenames.map { Modification(it) }
    }

    //    @Test
    //    @Suppress
    //    @Throws(Exception::class)
    //    fun canCreateAnEmptyProject() {
    //        // given
    //        val projectConverter = ProjectConverter(true)
    //
    //        // when
    //        val project = projectConverter.convert(emptyList(), metricsFactory)
    //
    //        // then
    //        assertThat(project.rootNode.leaves).hasSize(1)
    //    }

    //    @Test
    //    @Suppress
    //    fun canConvertProjectWithAuthors() {
    //        // given
    //        val projectConverter = ProjectConverter(true)
    //        val file1 = VersionControlledFile("File 1", metricsFactory)
    //        file1.registerCommit(Commit("Author", modificationsByFilename("File 1", "File 2"), OffsetDateTime.now()))
    //
    //        // when
    //        val project = projectConverter.convert(Arrays.asList(file1), metricsFactory)
    //
    //        // then
    //        assertThat(project.rootNode.children.toMutableList()[0].attributes.containsKey("authors")).isTrue()
    //    }

    //    @Test
    //    @Suppress
    //    fun canConvertProjectWithoutAuthors() {
    //        // given
    //        val projectConverter = ProjectConverter(false)
    //        val file1 = VersionControlledFile("File 1", metricsFactory)
    //        file1.registerCommit(Commit("Author", modificationsByFilename("File 1", "File 2"), OffsetDateTime.now()))
    //
    //        // when
    //        val project = projectConverter.convert(Arrays.asList(file1), metricsFactory)
    //
    //        // then
    //        assertThat(project.rootNode.children.toMutableList()[0].attributes.containsKey("authors")).isFalse()
    //    }

    //    @Test
    //    fun edgesAreRegisteredInProject() {
    //        // given
    //        val projectConverter = ProjectConverter(true)
    //        val metricsFactory = MetricsFactory().createMetrics()
    //        val file1 = VersionControlledFile("File 1", metricsFactory)
    //        val commit = Commit("Author", modificationsByFilename("File 1", "File 2"), OffsetDateTime.now())
    //        for (i in 0..4) {
    //            file1.registerCommit(commit)
    //        }
    //
    //        // when
    //        val project = projectConverter.convert(listOf(file1), MetricsFactory())
    //
    //        // then
    //        assertThat(project.edges.size).isEqualTo(1)
    //        assertThat(project.edges[0].toNodeName).isEqualTo("/root/File 2")
    //        assertThat(project.edges[0].fromNodeName).isEqualTo("/root/File 1")
    //    }

    //    @Test
    //    @Suppress
    //    fun attributeTypesAreCreated() {
    //        val projectConverter = ProjectConverter(false)
    //        val project = projectConverter.convert(listOf(), MetricsFactory())
    //
    //        assertThat(project.attributeTypes).containsKeys("edges", "nodes")
    //    }
}
