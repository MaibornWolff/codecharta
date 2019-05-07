package de.maibornwolff.codecharta.importer.scmlogparser.converter

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification
import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import io.mockk.every
import io.mockk.mockk
import org.assertj.core.api.Assertions.assertThat
import org.junit.Before
import org.junit.Test
import java.time.OffsetDateTime
import java.util.*

class ProjectConverterTest {

    private val metricsFactory = mockk<MetricsFactory>()

    @Before
    fun setup() {
        every { metricsFactory.createMetrics() } returns emptyList()
    }

    private fun modificationsByFilename(vararg filenames: String): List<Modification> {
        return filenames.map { Modification(it) }
    }

    @Test
    @Throws(Exception::class)
    fun canCreateAnEmptyProject() {
        // given
        val projectname = "Projectname"
        val projectConverter = ProjectConverter(true, projectname)

        // when
        val project = projectConverter.convert(emptyList())

        //then
        assertThat(project.rootNode.leaves).hasSize(1)
        assertThat(project.projectName).isEqualTo(projectname)
    }

    @Test
    fun canConvertProjectWithAuthors() {
        //given
        val projectConverter = ProjectConverter(true, "ProjectWithAuthors")
        val file1 = VersionControlledFile("File 1", metricsFactory)
        file1.registerCommit(Commit("Author", modificationsByFilename("File 1, File 2"), OffsetDateTime.now()))

        //when
        val project = projectConverter.convert(Arrays.asList(file1))

        //then
        assertThat(project.rootNode.children[0].attributes.containsKey("authors")).isTrue()
    }

    @Test
    fun canConvertProjectWithoutAuthors() {
        //given
        val projectConverter = ProjectConverter(false, "ProjectWithoutAuthors")
        val file1 = VersionControlledFile("File 1", metricsFactory)
        file1.registerCommit(Commit("Author", modificationsByFilename("File 1, File 2"), OffsetDateTime.now()))

        //when
        val project = projectConverter.convert(Arrays.asList(file1))

        //then
        assertThat(project.rootNode.children[0].attributes.containsKey("authors")).isFalse()
    }
}
