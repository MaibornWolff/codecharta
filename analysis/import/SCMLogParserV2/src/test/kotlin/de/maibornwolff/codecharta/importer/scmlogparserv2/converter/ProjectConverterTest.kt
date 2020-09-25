package de.maibornwolff.codecharta.importer.scmlogparserv2.converter

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Modification
import de.maibornwolff.codecharta.importer.scmlogparserv2.input.VersionControlledFile
import de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.VersionControlledFilesList
import io.mockk.every
import io.mockk.mockk
import org.assertj.core.api.Assertions.assertThat
import org.junit.Before
import org.junit.Test
import java.time.OffsetDateTime

class ProjectConverterTest {

    private val metricsFactory = mockk<MetricsFactory>()

    @Before
    fun setup() {
        every { metricsFactory.createMetrics() } returns listOf()
    }

    private fun modificationsByFilename(vararg filenames: String): List<Modification> {
        return filenames.map { Modification(it) }
    }

    @Test
    @Throws(Exception::class)
    fun canCreateAnEmptyProject() {
        // given
        val projectConverter = ProjectConverter(true)
        val metricsFactory = MetricsFactory()
        val vcfList = VersionControlledFilesList(metricsFactory)
        // when
        val project = projectConverter.convert(vcfList, metricsFactory, listOf())

        // then
        assertThat(project.rootNode.leaves).hasSize(1)
    }

    @Test
    fun canConvertProjectWithAuthors() {
        // given
        val projectConverter = ProjectConverter(true)
        val file1 = VersionControlledFile("File 1", metricsFactory)
        val vcfList = VersionControlledFilesList(metricsFactory)

        vcfList.addFileBy("File 1")
        file1.registerCommit(
            Commit("Author", modificationsByFilename("File 1", "File 2"), OffsetDateTime.now()),
            Modification.EMPTY
        )

        // when
        val project = projectConverter.convert(vcfList, metricsFactory, listOf("File 1"))

        // then
        assertThat(project.rootNode.children.toMutableList()[0].attributes.containsKey("authors")).isTrue()
    }

    @Test
    fun canConvertProjectWithoutAuthors() {
        // given
        val projectConverter = ProjectConverter(false)
        val file1 = VersionControlledFile("File 1", metricsFactory)
        val vcfList = VersionControlledFilesList(metricsFactory)

        vcfList.addFileBy("File 1")
        file1.registerCommit(
            Commit("Author", modificationsByFilename("File 1", "File 2"), OffsetDateTime.now()),
            Modification.EMPTY
        )

        // when
        val project = projectConverter.convert(vcfList, metricsFactory, listOf("File 1"))

        // then
        assertThat(project.rootNode.children.toMutableList()[0].attributes.containsKey("authors")).isFalse()
    }

    @Test
    fun attributeTypesAreCreated() {
        val projectConverter = ProjectConverter(false)
        val vcfList = VersionControlledFilesList(metricsFactory)
        val project = projectConverter.convert(vcfList, MetricsFactory(), listOf())

        assertThat(project.attributeTypes).containsKeys("edges", "nodes")
    }
}
