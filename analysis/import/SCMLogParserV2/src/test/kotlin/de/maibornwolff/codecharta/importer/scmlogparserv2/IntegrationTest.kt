package de.maibornwolff.codecharta.importer.scmlogparserv2

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.LogLineParser
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.VersionControlledFilesList
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.git.GitLogNumstatRawParserStrategy
import org.hamcrest.CoreMatchers.hasItem
import org.junit.Assert
import org.junit.Test
import java.io.File
import java.io.InputStream
import java.util.Arrays

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

    private fun emulateProjectConverter(
        vcFList: VersionControlledFilesList,
        project_name_list: List<String>
    ): List<String> {

        vcFList.getList().values
            .forEach {
                it.filename = it.filename.substringBefore("_\\0_")
            }

        return vcFList.getList().values.filter { project_name_list.contains(it.filename) }
            .map { file -> file.filename }
    }

    @Test
    fun test_given_list_of_all_files_in_project_when_parsing_corresponding_git_log_then_both_list_contents_are_equal() {

        // Git-names in Repo
        val resourceName = "names-in-git-repo.txt"
        val classLoader = javaClass.classLoader
        val file = File(classLoader.getResource(resourceName)!!.file)
        val project_name_list = readFileNameListFile(file)

        // parsed git-log
        val parserStrategy = GitLogNumstatRawParserStrategy()
        val codeChartaLog = this.javaClass.classLoader.getResourceAsStream("codeCharta.log")
        val parser = LogLineParser(parserStrategy, metricsFactory)
        val codeList = mutableListOf<String>()
        codeChartaLog.bufferedReader().forEachLine { codeList.add(it) }
        val vcFList = parser.parse(codeList.stream())

        val namesInVCF = emulateProjectConverter(vcFList, project_name_list)

        val newList = project_name_list.filter { element ->
            !namesInVCF.contains(element)
        }

        for (item in newList) {
            println("Mssing: $item")
        }

        for (item in namesInVCF) {
            Assert.assertThat(project_name_list, hasItem(item))
        }
    }
}
