package de.maibornwolff.codecharta.importer.gitlogparser.util

import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.File
import java.nio.file.Paths

class GitAdapterTest {

    @Test
    fun `should produce a gitLog that contains commits`() {
        val gitLog = GitAdapter(File(Paths.get("").toAbsolutePath().toUri())).getGitLog()
        val commitRegex = """commit [0-9a-f]{5,40}""".toRegex()

        assertTrue(gitLog.isNotEmpty())
        assertTrue(gitLog[0].matches(commitRegex))
    }

    @Test
    fun `should produce a not empty git file list for the current directory`() {
        val gitLs = GitAdapter(File(Paths.get("").toAbsolutePath().toUri())).getGitFiles()

        assertTrue(gitLs.isNotEmpty())
    }
}
