package de.maibornwolff.codecharta.importer.scmlogparser.parser.svn

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogLineParser
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy
import de.maibornwolff.codecharta.importer.scmlogparser.parser.ParserStrategyContractTest
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import java.util.Arrays
import java.util.stream.Stream

class SVNLogParserStrategyTest : ParserStrategyContractTest() {

    private var parserStrategy: SVNLogParserStrategy = SVNLogParserStrategy()

    override val fullCommit: List<String>
        get() = FULL_COMMIT

    override val twoCommitsAsStraem: Stream<String>
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
    fun parsesFilenameFromFileMetadata() {
        val modification = parserStrategy.parseModification("   M /src/srcFolderTest.txt")
        assertThat(modification.currentFilename).isEqualTo("src/srcFolderTest.txt")
        assertThat(modification.type).isEqualTo(Modification.Type.MODIFY)
    }

    @Test
    fun parsesFilenameFromAddedFile() {
        val modification = parserStrategy.parseModification("   A /src/srcFolderTest.txt")
        assertThat(modification.currentFilename).isEqualTo("src/srcFolderTest.txt")
        assertThat(modification.type).isEqualTo(Modification.Type.ADD)
    }

    @Test
    fun parsesFilenameFromDeletedFile() {
        val modification = parserStrategy.parseModification("   D  /src/srcFolderTest.txt")
        assertThat(modification.currentFilename).isEqualTo("src/srcFolderTest.txt")
        assertThat(modification.type).isEqualTo(Modification.Type.DELETE)
    }

    @Test
    fun parsesFilenameFromReplacedFile() {
        val modification = parserStrategy.parseModification("   R  /src/srcFolderTest.txt")
        assertThat(modification.currentFilename).isEqualTo("src/srcFolderTest.txt")
        assertThat(modification.type).isEqualTo(Modification.Type.UNKNOWN)
    }

    @Test
    fun doesNotParseFilenameWithoutADot() {
        val modification = parserStrategy.parseModification("   A /innerFolder")
        assertThat(modification.currentFilename).isEmpty()
    }

    @Test
    fun removesStandardSVNFoldersInFilename() {
        val modification = parserStrategy.parseModification("   M /trunk/src/srcFolderTest.txt")
        assertThat(modification.currentFilename).isEqualTo("src/srcFolderTest.txt")
    }

    @Test
    fun acceptsSVNLogWithoutEndingDashes() {
        val logLinesWithoutEndingDashes = Stream.of("------------------------------------------------------------------------", "commit data")
        val commits = logLinesWithoutEndingDashes.collect(parserStrategy.createLogLineCollector())
        assertThat(commits).hasSize(1)
    }

    @Test
    fun ignoresTooShortLines() {
        val lines = Arrays.asList(" A", "B")
        val modifications = parserStrategy.parseModifications(lines)
        assertThat(modifications).isEmpty()
    }

    @Test
    fun parsesSpecialCommit() {
        val parser = LogLineParser(logParserStrategy, MetricsFactory())
        val commitString = mutableListOf(
            "------------------------------------------------------------------------",
            "r156657 | dpagam05 | 2017-01-02 03:12:18 +0100 (Mo, 02 Jan 2017) | 1 line",
            "Changed paths:",
            "    M /src/Modified.java",
            "Task | Increased automaticly build number | builduser01",
            "------------------------------------------------------------------------"
        )
        val commit = parser.parseCommit(commitString)
        assertThat(commit.filenames)
            .containsExactlyInAnyOrder("src/Modified.java")
    }

    companion object {

        private val FULL_COMMIT = mutableListOf(
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
