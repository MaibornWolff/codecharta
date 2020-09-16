package de.maibornwolff.codecharta.importer.scmlogparserv2

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.LogLineParser
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.git.GitLogNumstatRawParserStrategy
import org.hamcrest.CoreMatchers.hasItem
import org.junit.Assert
import org.junit.Test
import java.io.File
import java.io.InputStream
import java.util.Arrays

// TODO not working yet, we can't handle logs in place
class IntegrationTest {

    private val metricsFactory = MetricsFactory(
        Arrays.asList(
            "number_of_authors",
            "number_of_commits",
            "weeks_with_commits",
            "range_of_weeks_with_commits",
            "successive_weeks_with_commits"
        )
    )

    private fun readFileNameListFile(path: File): MutableList<String> {
        val inputStream: InputStream = path.inputStream()
        val lineList = mutableListOf<String>()

        inputStream.bufferedReader().forEachLine { lineList.add(it) }

        return lineList
    }

    // TODO make test working :)
    @Test
    fun test_given_list_of_all_files_in_project_when_parsing_corresponding_git_log_then_both_list_contents_are_equal() {
        // TODO we don't write to file anymore to prevent unnecessary I/O, but I can roll that back if we happen to need it
        // this.javaClass.classLoader.getResourceAsStream("sourcemonitor.csv")

        //Git-names in Repo
        val resourceName = "names-in-git-repo.txt"
        val classLoader = javaClass.classLoader
        val file = File(classLoader.getResource(resourceName)!!.file)
        val project_name_list = readFileNameListFile(file)

        //parsed git-log
        val parserStrategy = GitLogNumstatRawParserStrategy()
        val codeChartaLog = this.javaClass.classLoader.getResourceAsStream("codeCharta.log")
        val parser = LogLineParser(parserStrategy, metricsFactory)
        val codeList = mutableListOf<String>()
        codeChartaLog.bufferedReader().forEachLine { codeList.add(it) }
        val vcFList = parser.parse(codeList.stream())
        val namesInVCF: List<String> =
            vcFList.getList().values.filter { project_name_list.contains(it.filename) }
                .map { file -> file.filename }

        val newList = project_name_list.filter { element ->
            !namesInVCF.contains(element)
        }

        for (e in newList) {
            println(e)
        }

        for (item in namesInVCF) {
            Assert.assertThat(project_name_list, hasItem(item))
        }
    }
}
