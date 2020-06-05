package de.maibornwolff.codecharta.importer.scmlogparser

import de.maibornwolff.codecharta.importer.scmlogparser.converter.ProjectConverter
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.GitLogNumstatRawParserStrategy
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.GitLogParserStrategy
import de.maibornwolff.codecharta.importer.scmlogparser.parser.svn.SVNLogParserStrategy
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.model.ProjectMatcher
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import org.junit.Assert
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.Parameterized
import java.io.* // ktlint-disable no-wildcard-imports
import java.nio.file.Files
import java.nio.file.Paths
import java.util.* // ktlint-disable no-wildcard-imports

@RunWith(Parameterized::class)
class SCMLogProjectCreatorGoldenMasterTest(
    val scm: String,
    private val strategy: LogParserStrategy,
    private val containsAuthors: Boolean,
    private val logFilename: String,
    private val expectedProjectFilename: String
) {
    companion object {
        @JvmStatic
        @Parameterized.Parameters(name = "{index}: {0}")
        fun data(): Collection<Array<Any>> {
            return Arrays.asList(
                arrayOf("svn", SVNLogParserStrategy(), true, "example_svn.log", "expected_svn.json"),
                arrayOf(
                    "git_numstat",
                    GitLogNumstatRawParserStrategy(),
                    true,
                    "example_git_numstat.log",
                    "expected_git_numstat.json"
                ),
                arrayOf("git", GitLogParserStrategy(), false, "example_git.log", "expected_git.json")
            )
        }
    }

    private val metricsFactory = MetricsFactory(
        Arrays.asList(
            "number_of_authors",
            "number_of_commits",
            "weeks_with_commits",
            "range_of_weeks_with_commits",
            "successive_weeks_with_commits"
        )
    )

    @Test
    @Throws(Exception::class)
    fun logParserGoldenMasterTest() {
        // given
        val projectConverter = ProjectConverter(containsAuthors)
        val svnSCMLogProjectCreator = SCMLogProjectCreator(strategy, metricsFactory, projectConverter, silent = true)
        val ccjsonReader = InputStreamReader(this.javaClass.classLoader.getResourceAsStream(expectedProjectFilename)!!)
        val expectedProject = ProjectDeserializer.deserializeProject(ccjsonReader)
        val resource = this.javaClass.classLoader.getResource(logFilename)
        val logStream = Files.lines(Paths.get(resource!!.toURI()))
        // when
        val svnProject = svnSCMLogProjectCreator.parse(logStream)
        // This step is necessary because the comparison of the attribute map in MutableNode fails if the project is used directly;
        val svnProjectForComparison = serializeAndDeserializeProject(svnProject)
        // then
        Assert.assertThat(svnProjectForComparison, ProjectMatcher.matchesProjectUpToVersion(expectedProject))
    }

    @Throws(IOException::class)
    private fun serializeAndDeserializeProject(svnProject: Project): Project {
        ByteArrayOutputStream().use { baos ->
            ProjectSerializer.serializeProject(svnProject, OutputStreamWriter(baos))
            return ProjectDeserializer.deserializeProject(InputStreamReader(ByteArrayInputStream(baos.toByteArray())))
        }
    }
}