package de.maibornwolff.codecharta.analysers.parsers.gitlog.util

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Assertions.assertThrowsExactly
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.io.File
import java.nio.file.Paths

class GitAdapterTest {
    @Test
    fun `should produce a gitLog that contains commits`() {
        val gitFile = File.createTempFile("git", ".log")
        gitFile.deleteOnExit()
        GitAdapter(File(Paths.get("").toAbsolutePath().toUri()), gitFile).getGitLog()
        val commitRegex = """commit [0-9a-f]{5,40}""".toRegex()

        assertTrue(gitFile.exists())
        assertTrue(gitFile.inputStream().bufferedReader().readLine().matches(commitRegex))
    }

    @Test
    fun `should throw error with exit code if non-zero`() {
        val gitFile = File.createTempFile("git", ".log")
        gitFile.deleteOnExit()

        val assertion = assertThrowsExactly(RuntimeException::class.java) { GitAdapter(File(gitFile.parent), gitFile).getGitLog() }
        Assertions.assertThat(assertion).hasMessageContainingAll(
            "Error while executing Git! Command was",
            "[git, log, --numstat, --raw, --topo-order, --reverse, -m]",
            "Process returned with exit status",
            "128"
        )
    }

    @Test
    fun `should produce a not empty git file list for the current directory`() {
        val gitLs = File.createTempFile("git", ".log")
        gitLs.deleteOnExit()
        GitAdapter(File(Paths.get("").toAbsolutePath().toUri()), gitLs).getGitFiles()

        assertTrue(gitLs.length() > 0)
    }
}
