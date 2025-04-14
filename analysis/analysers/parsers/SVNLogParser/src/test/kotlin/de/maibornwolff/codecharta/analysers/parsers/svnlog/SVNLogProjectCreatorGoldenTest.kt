package de.maibornwolff.codecharta.analysers.parsers.svnlog

import de.maibornwolff.codecharta.analysers.parsers.svnlog.converter.ProjectConverter
import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.analysers.parsers.svnlog.parser.svn.SVNLogParserStrategy
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.IOException
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.nio.file.Files
import java.nio.file.Paths

class SVNLogProjectCreatorGoldenTest {
    private val svn = "svn"
    private val strategy = SVNLogParserStrategy()
    private val containsAuthors = true
    private val logFilename = "example_svn.log"
    private val expectedProjectFilename = "expected_svn.json"

    private val metricsFactory =
        MetricsFactory(
            listOf(
                "number_of_authors",
                "number_of_commits",
                "weeks_with_commits",
                "range_of_weeks_with_commits",
                "successive_weeks_with_commits"
            )
        )

    @Test
    @Throws(Exception::class)
    fun `log parser golden test`() { // given
        val projectConverter = ProjectConverter(containsAuthors)

        val svnSVNLogProjectCreator = SVNLogProjectCreator(strategy, metricsFactory, projectConverter, silent = true)
        val ccjsonReader = InputStreamReader(this.javaClass.classLoader.getResourceAsStream(expectedProjectFilename)!!)
        val expectedProject = ProjectDeserializer.deserializeProject(ccjsonReader)
        val resource = this.javaClass.classLoader.getResource(logFilename)
        val logStream = Files.lines(Paths.get(resource!!.toURI())) // when
        val svnProject =
            svnSVNLogProjectCreator.parse(
                logStream
            ) // This step is necessary because the comparison of the attribute map in MutableNode fails if the project is used directly;
        val svnProjectForComparison = serializeAndDeserializeProject(svnProject)

        // then
        assertThat(svnProjectForComparison).usingRecursiveComparison().isEqualTo(expectedProject)
    }

    @Throws(IOException::class)
    private fun serializeAndDeserializeProject(svnProject: Project): Project {
        ByteArrayOutputStream().use { baos ->
            ProjectSerializer.serializeProject(svnProject, OutputStreamWriter(baos))
            return ProjectDeserializer.deserializeProject(InputStreamReader(ByteArrayInputStream(baos.toByteArray())))
        }
    }
}
