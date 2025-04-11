package de.maibornwolff.codecharta.analysers.parsers.gitlog

import de.maibornwolff.codecharta.analysers.parsers.gitlog.GitLogParser.Companion.main
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import java.io.File

class GitLogParserTest {
    companion object {
        @JvmStatic
        fun provideInvalidInputFiles(): List<Arguments> {
            return listOf(
                Arguments.of("src/test/resources/my/empty/repo"),
                Arguments.of("src/test/resources/this/does/not/exist"),
                Arguments.of(""),
                Arguments.of("src/test/resources/my")
            )
        }
    }

    @Test
    fun `should create json uncompressed file repo-scan`() {
        main(
            arrayOf(
                "repo-scan",
                "--repo-path=../../..",
                "--output-file=src/test/resources/gitlog-analysis-repo.cc.json",
                "--not-compressed",
                "--silent=false",
                "--add-author=false"
            )
        )
        val file = File("src/test/resources/gitlog-analysis-repo.cc.json")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should create json uncompressed file log-scan`() {
        main(
            arrayOf(
                "log-scan",
                "--git-log=src/test/resources/codeCharta.log",
                "--repo-files=src/test/resources/names-in-git-repo.txt",
                "--output-file=src/test/resources/gitlog-analysis-log.cc.json",
                "--not-compressed",
                "--silent=true"
            )
        )
        val file = File("src/test/resources/gitlog-analysis-log.cc.json")
        file.deleteOnExit()
        assertTrue(file.exists())
        val project = ProjectDeserializer.deserializeProject(file.inputStream())
        assertEquals(
            project.attributeDescriptors,
            getAttributeDescriptors()
        )
    }

    @Test
    fun `should create json gzip file log-scan`() {
        main(
            arrayOf(
                "log-scan",
                "--git-log=src/test/resources/codeCharta.log",
                "--repo-files=src/test/resources/names-in-git-repo.txt",
                "--output-file=src/test/resources/gitlog-analysis.cc.json",
                "--silent=true"
            )
        )
        val file = File("src/test/resources/gitlog-analysis.cc.json.gz")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should be identified as applicable for given directory path containing a git folder`() {
        val gitFolderParentFilePath = "src/test/resources/my/git/repo/"
        val gitFolderFilePath = "src/test/resources/my/git/repo/.git"

        val testGitDirectory = File(gitFolderFilePath)
        testGitDirectory.mkdir()
        testGitDirectory.deleteOnExit()

        val isUsableFromParentFolder = GitLogParser().isApplicable(gitFolderParentFilePath)
        val isUsableFromGitFolder = GitLogParser().isApplicable(gitFolderFilePath)

        Assertions.assertThat(isUsableFromParentFolder).isTrue()
        Assertions.assertThat(isUsableFromGitFolder).isTrue()
    }

    @ParameterizedTest
    @MethodSource("provideInvalidInputFiles")
    fun `should NOT be identified as applicable if no git folder is present at given path`(resourceToBeParsed: String) {
        val isUsable = GitLogParser().isApplicable(resourceToBeParsed)
        Assertions.assertThat(isUsable).isFalse()
    }
}
