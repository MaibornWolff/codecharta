package de.maibornwolff.codecharta.importer.scmlogparser

import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogLineParser
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.GitLogNumstatRawParserStrategy
import org.hamcrest.CoreMatchers.hasItem
import org.junit.Assert
import org.junit.jupiter.api.Test
import java.io.File
import java.io.IOException
import java.util.Arrays
import java.util.concurrent.TimeUnit

//TODO not working yet, we can't handle logs in place
// right now it breaks the application
class IntegrationTest {
    private var filenamesInGitRepo = mutableListOf<String>()

    fun setup() {

        val path = convertPathCodeCharta()
        executeGitCommand("git ls-files ", File(path), filenamesInGitRepo)
    }

    fun convertPathCodeCharta(): String {
        val path = System.getProperty("user.dir")
        val separator = System.getProperty("file.separator")

        return path.substringBeforeLast(separator)
    }

    fun executeGitCommand(gitCommand: String, workingDir: File, list: MutableList<String>){
        try {
            val commands = gitCommand.split("\\s".toRegex())
            val proc = ProcessBuilder(*commands.toTypedArray())
                .directory(workingDir)
                .redirectOutput(ProcessBuilder.Redirect.PIPE)
                .redirectError(ProcessBuilder.Redirect.PIPE)
                .start()

            proc.waitFor(60, TimeUnit.SECONDS)

                proc.inputStream.bufferedReader().useLines { lines ->
                    lines.forEach {
                        list.add(it)
                    }
            }
        } catch (e: IOException) {
            error("Invalid git command.")
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
    fun test_given_list_of_all_files_in_project_when_parsing_corresponding_git_log_then_both_list_contents_are_equal() {
        //TODO we don't write to file anymore to prevent unnecessary I/O, but I can roll that back if we happen to need it
        setup()
        val logPath = convertPathCodeCharta()
        val gitLog = mutableListOf<String>()
        executeGitCommand("git log --numstat --raw --topo-order --reverse -m", File(logPath), gitLog)
        //TODO LogParserStrategy concrete/ mocked object
        val parserStrategy = GitLogNumstatRawParserStrategy()

        //TODO no answer found, mocking doesnt work
        val parser = LogLineParser(parserStrategy, metricsFactory)
        val vcFList = parser.parse(gitLog.stream())
        val namesInVCF :List<String> = vcFList.getList().values.filter {!it.isDeleted() || filenamesInGitRepo.contains(it.filename)}.map { file -> file.filename }

        //TODO assertThat from hamcrest doesnt work
        for(item in namesInVCF){
            Assert.assertThat(filenamesInGitRepo, hasItem(item))
        }
    }
}