package de.maibornwolff.codecharta.importer.scmlogparser

import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogLineParser
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy
import io.mockk.mockk
import org.junit.Assert.assertTrue
import org.junit.jupiter.api.Test
import java.io.File
import java.io.IOException
import java.util.concurrent.TimeUnit

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

    @Test
    fun test_given_list_of_all_files_in_project_when_parsing_corresponding_git_log_then_both_list_contents_are_equal() {
        //TODO we don't write to file anymore to prevent unnecessary I/O, but I can roll that back if we happen to need it
        setup()
        val logPath = convertPathCodeCharta()
        val gitLog = mutableListOf<String>()
        executeGitCommand("git log -m --topo-order --raw --reverse", File(logPath), gitLog)
        val parserStrategy = mockk<LogParserStrategy>()
        val metricsFactory = mockk<MetricsFactory>()

        //TODO no answer found, mocking doesnt work
        val parser = LogLineParser(parserStrategy, metricsFactory)
        val vcFList = parser.parse(gitLog.stream())
        val namesInVCF :List<String> = vcFList.getList().values.filter{!it.isDeleted() && !it.isMutated()}.map { file -> file.filename }

        //TODO assertThat from hamcrest doesnt work
        assertTrue(namesInVCF.size == filenamesInGitRepo.size &&
            namesInVCF.containsAll(filenamesInGitRepo) && filenamesInGitRepo.containsAll(namesInVCF))
    }
}