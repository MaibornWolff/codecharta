package de.maibornwolff.codecharta.importer.svnlogparser

import de.maibornwolff.codecharta.importer.svnlogparser.SVNLogParser.Companion.main
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.File

class SVNLogParserTest {

    @Test
    fun `should create json uncompressed file`() {
        main(
            arrayOf(
                "src/test/resources/example_svn.log",
                "--output-file=src/test/resources/svn-analysis.cc.json",
                "--not-compressed",
                "--silent"
                   )
            )
        val file = File("src/test/resources/svn-analysis.cc.json")
        file.deleteOnExit()

        assertTrue(file.exists())
    }

    @Test
    fun `should create json gzip file`() {
        main(
            arrayOf(
                "src/test/resources/example_svn.log",
                "--output-file=src/test/resources/svn-analysis.cc.json",
                   )
            )
        val file = File("src/test/resources/svn-analysis.cc.json.gz")
        file.deleteOnExit()

        assertTrue(file.exists())
    }
}
