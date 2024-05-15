package de.maibornwolff.codecharta.importer.gitlogparser

import de.maibornwolff.codecharta.importer.gitlogparser.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.importer.gitlogparser.parser.LogLineParser
import de.maibornwolff.codecharta.importer.gitlogparser.parser.VersionControlledFilesInGitProject
import de.maibornwolff.codecharta.importer.gitlogparser.parser.git.GitLogNumstatRawParserStrategy
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.File
import java.io.InputStream

class ParsingIntegrationTest {
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

    private fun readFileNameListFile(path: File): MutableList<String> {
        val inputStream: InputStream = path.inputStream()
        val lineList = mutableListOf<String>()

        inputStream.bufferedReader().forEachLine { lineList.add(it) }

        return lineList
    }

    @Test
    fun test_given_list_of_all_files_in_project_when_parsing_corresponding_git_log_then_both_list_contents_are_equal() { // Git-names in Repo
        val resourceName = "names-in-git-repo.txt"
        val classLoader = javaClass.classLoader
        val file = File(classLoader.getResource(resourceName)!!.file)
        val projectNameList = readFileNameListFile(file)

        // parsed git-log
        val parserStrategy = GitLogNumstatRawParserStrategy()
        val codeChartaLog = this.javaClass.classLoader.getResourceAsStream("codeCharta.log")
        val parser = LogLineParser(parserStrategy, metricsFactory)
        val codeList = mutableListOf<String>()
        codeChartaLog?.bufferedReader()?.forEachLine { codeList.add(it) }
        val vcFList = parser.parse(codeList.stream())

        val versionControlledFilesInGitProject = VersionControlledFilesInGitProject(vcFList.getList(), projectNameList)

        val namesInVCF =
            versionControlledFilesInGitProject.getListOfVCFilesMatchingGitProject()
                .map { versionControlledFile -> versionControlledFile.filename }

        projectNameList.filter { element ->
            !namesInVCF.contains(element)
        }

        assertEquals(projectNameList.size, namesInVCF.size)

        for (item in namesInVCF) {
            assertTrue(projectNameList.contains(item))
        }

        for (item in projectNameList) {
            assertTrue(namesInVCF.contains(item))
        }
    }
}
