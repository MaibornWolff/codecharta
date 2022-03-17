package de.maibornwolff.codecharta.importer.svnlogparser

import de.maibornwolff.codecharta.importer.svnlogparser.converter.ProjectConverter
import de.maibornwolff.codecharta.importer.svnlogparser.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.importer.svnlogparser.parser.LogParserStrategy
import de.maibornwolff.codecharta.importer.svnlogparser.parser.git.GitLogNumstatParserStrategy
import de.maibornwolff.codecharta.importer.svnlogparser.parser.git.GitLogNumstatRawParserStrategy
import de.maibornwolff.codecharta.model.Project
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.Parameterized
import java.nio.file.Files
import java.nio.file.Paths
import java.util.Arrays
import java.util.function.Function

@RunWith(Parameterized::class)
class SVNLogProjectCreatorTest(
    val testName: String,
    private val strategy: LogParserStrategy,
    private val logFilename: String,
    private val expectedProjectSize: Long
                              ) {

    companion object {

        @JvmStatic
        @Parameterized.Parameters(name = "{index}: {0}")
        fun data(): Collection<Array<Any>> {
            return Arrays.asList(
                arrayOf(
                    "--numstat --raw",
                    GitLogNumstatRawParserStrategy(),
                    "codecharta_git_numstat_raw.log",
                    358L
                ),
                arrayOf("--numstat", GitLogNumstatParserStrategy(), "codecharta_git_numstat.log", 472L)
            )
        }
    }

    private val metricsFactory = MetricsFactory()
    private val projectConverter = ProjectConverter(false)

    @Test
    @Throws(Exception::class)
    fun logParserGitExampleTest() {
        // given
        val gitSVNLogProjectCreator = SVNLogProjectCreator(
            strategy,
            metricsFactory,
            projectConverter,
            silent = true
                                                          )
        val logStream = Files.lines(Paths.get(this.javaClass.classLoader.getResource(logFilename)!!.toURI()))

        // when
        val gitProject = gitSVNLogProjectCreator.parse(logStream)

        // then
        assertThat(gitProject)
            .extracting(Function<Project, Any> { it.size.toLong() })
            .isEqualTo(expectedProjectSize)
        assertNodesValid(gitProject)
    }

    private fun assertNodesValid(project: Project) {
        val leaves = project.rootNode.leaves.values
        leaves.flatMap { l -> l.attributes.entries }
            .forEach { v ->
                assertThat((v.value as Number).toDouble())
                    .`as`("attribute %s non positive (%s)", v.key, v.value)
                    .isGreaterThanOrEqualTo(0.0)
            }
    }
}
