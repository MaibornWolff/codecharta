package de.maibornwolff.codecharta.importer.gitlogparser

import de.maibornwolff.codecharta.importer.gitlogparser.GitLogParser.Companion.main
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.File

class GitLogParserTest {

    @Test
    fun `should create json uncompressed file`() {
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
    fun `should create json gzip file`() {
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
