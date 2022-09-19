package de.maibornwolff.codecharta.importer.gitlogparser

import de.maibornwolff.codecharta.importer.gitlogparser.GitLogParser.Companion.main
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import java.io.File

class GitLogParserTest {

    @Test
    @Disabled
    fun `should create json uncompressed file repo-scan`() {
        main(
            arrayOf(
                "repo-scan",
                "--repo-path=C:\\Users\\FriedrichR\\IdeaProjects\\codecharta",
                "--output-file=src/test/resources/gitlog-analysis.cc.json",
                "--not-compressed",
                "--silent=false",
                "--add-author=false"
            )
        )
        val file = File("src/test/resources/gitlog-analysis.cc.json")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should create json gzip file repo-scan`() {
        main(
            arrayOf(
                "src/test/resources/codeCharta.log",
                "--output-file=src/test/resources/gitlog-analysis.cc.json",
                "--file-name-list=src/test/resources/names-in-git-repo.txt",
                "--silent=false"
            )
        )
        val file = File("src/test/resources/gitlog-analysis.cc.json.gz")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should create json uncompressed file log-scan`() {
        main(
            arrayOf(
                "src/test/resources/codeCharta.log",
                "--output-file=src/test/resources/gitlog-analysis.cc.json",
                "--file-name-list=src/test/resources/names-in-git-repo.txt",
                "--not-compressed",
                "--silent=true"
            )
        )
        val file = File("src/test/resources/gitlog-analysis.cc.json")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should create json gzip file log-scan`() {
        main(
            arrayOf(
                "src/test/resources/codeCharta.log",
                "--output-file=src/test/resources/gitlog-analysis.cc.json",
                "--file-name-list=src/test/resources/names-in-git-repo.txt",
                "--silent=false"
            )
        )
        val file = File("src/test/resources/gitlog-analysis.cc.json.gz")
        file.deleteOnExit()

        assertTrue(file.exists())
    }
}
