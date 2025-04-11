package de.maibornwolff.codecharta.analysers.parsers.svnlog.parser.svn

import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.Modification
import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.analysers.parsers.svnlog.parser.LogLineParser
import de.maibornwolff.codecharta.analysers.parsers.svnlog.parser.LogParserStrategy
import de.maibornwolff.codecharta.analysers.parsers.svnlog.parser.ParserStrategyContractTest
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.util.stream.Stream

class SVNLogParserStrategyTest : ParserStrategyContractTest() {
    private var parserStrategy: SVNLogParserStrategy = SVNLogParserStrategy()

    override val fullCommit: List<String>
        get() = FULL_COMMIT

    override val twoCommitsAsStream: Stream<String>
        get() {
            val twoCommits = mutableListOf("------------------------------------------------------------------------")
            twoCommits.addAll(FULL_COMMIT)
            twoCommits.add("------------------------------------------------------------------------")
            twoCommits.addAll(FULL_COMMIT)
            twoCommits.add("------------------------------------------------------------------------")
            return twoCommits.stream()
        }

    override val logParserStrategy: LogParserStrategy
        get() = parserStrategy

    @Test
    fun `parses filename from file metadata`() {
        val modification = parserStrategy.parseModification("   M /src/srcFolderTest.txt")
        assertThat(modification.filename).isEqualTo("src/srcFolderTest.txt")
        assertThat(modification.type).isEqualTo(Modification.Type.MODIFY)
    }

    @Test
    fun `parses filename from added file`() {
        val modification = parserStrategy.parseModification("   A /src/srcFolderTest.txt")
        assertThat(modification.filename).isEqualTo("src/srcFolderTest.txt")
        assertThat(modification.type).isEqualTo(Modification.Type.ADD)
    }

    @Test
    fun `parses filename from deleted file`() {
        val modification = parserStrategy.parseModification("   D  /src/srcFolderTest.txt")
        assertThat(modification.filename).isEqualTo("src/srcFolderTest.txt")
        assertThat(modification.type).isEqualTo(Modification.Type.DELETE)
    }

    @Test
    fun `parses filename from replaced file`() {
        val modification = parserStrategy.parseModification("   R  /src/srcFolderTest.txt")
        assertThat(modification.filename).isEqualTo("src/srcFolderTest.txt")
        assertThat(modification.type).isEqualTo(Modification.Type.UNKNOWN)
    }

    @Test
    fun `does not parse filename without aDot`() {
        val modification = parserStrategy.parseModification("   A /innerFolder")
        assertThat(modification.filename).isEmpty()
    }

    @Test
    fun `removes standard svnFolders in filename`() {
        val modification = parserStrategy.parseModification("   M /trunk/src/srcFolderTest.txt")
        assertThat(modification.filename).isEqualTo("src/srcFolderTest.txt")
    }

    @Test
    fun `accepts svnLog without ending dashes`() {
        val logLinesWithoutEndingDashes =
            Stream.of("------------------------------------------------------------------------", "commit data")
        val commits = logLinesWithoutEndingDashes.collect(parserStrategy.createLogLineCollector())
        assertThat(commits).hasSize(1)
    }

    @Test
    fun `ignores too short lines`() {
        val lines = listOf(" A", "B")
        val modifications = parserStrategy.parseModifications(lines)
        assertThat(modifications).isEmpty()
    }

    @Test
    fun `parses special commit`() {
        val parser = LogLineParser(logParserStrategy, MetricsFactory())
        val commitString =
            mutableListOf(
                "------------------------------------------------------------------------",
                "r156657 | dpagam05 | 2017-01-02 03:12:18 +0100 (Mo, 02 Jan 2017) | 1 line",
                "Changed paths:",
                "    M /src/Modified.java",
                "Task | Increased automaticly build number | builduser01",
                "------------------------------------------------------------------------"
            )
        val commit = parser.parseCommit(commitString)
        assertThat(commit.filenames).containsExactlyInAnyOrder("src/Modified.java")
    }

    companion object {
        private val FULL_COMMIT =
            mutableListOf(
                "------------------------------------------------------------------------",
                "r2 | TheAuthor | 2017-05-09 19:57:57 +0200 (Tue, 9 May 2017) | 1 line",
                "Changed paths:",
                "   A /trunk/src/Added.java",
                "   M /trunk/src/Modified.java",
                "   D /trunk/src/Deleted.java",
                "the commit message"
            )
    }
}
