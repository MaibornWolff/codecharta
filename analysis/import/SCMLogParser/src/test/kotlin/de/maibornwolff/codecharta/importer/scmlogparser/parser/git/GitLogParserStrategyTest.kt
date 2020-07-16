package de.maibornwolff.codecharta.importer.scmlogparser.parser.git

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy
import de.maibornwolff.codecharta.importer.scmlogparser.parser.ParserStrategyContractTest
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.util.Lists
import org.junit.Test
import java.util.Arrays.asList
import java.util.stream.Stream

class GitLogParserStrategyTest : ParserStrategyContractTest() {

    private var parserStrategy: GitLogParserStrategy = GitLogParserStrategy()

    override val fullCommit: List<String>
        get() = FULL_COMMIT

    override val logParserStrategy: LogParserStrategy
        get() = parserStrategy

    override val twoCommitsAsStraem: Stream<String>
        get() {
            val twoCommits = Lists.newArrayList("commit")
            twoCommits.addAll(FULL_COMMIT)
            twoCommits.add("commit abcdef")
            twoCommits.addAll(FULL_COMMIT)
            twoCommits.add("commit")
            return twoCommits.stream()
        }

    @Test
    fun parsesFilenameFromFileMetadata() {
        val fileMetadata = "M\t src/Main.java"
        val modification = GitLogParserStrategy.parseModification(fileMetadata)
        assertThat(modification.currentFilename).isEqualTo("src/Main.java")
        assertThat(modification.type).isEqualTo(Modification.Type.MODIFY)
    }

    @Test
    fun parsesFilenameFromFileMetadataWithRename() {
        val fileMetadata = "R094\t srcs/Main.java\t src/Main.java"
        val modification = GitLogParserStrategy.parseModification(fileMetadata)
        assertThat(modification.currentFilename).isEqualTo("src/Main.java")
        assertThat(modification.oldFilename).isEqualTo("srcs/Main.java")
        assertThat(modification.type).isEqualTo(Modification.Type.RENAME)
    }

    @Test
    fun parsesFilenameFromAddedFile() {
        val fileMetadata = "A\t src/Main.java"
        val modification = GitLogParserStrategy.parseModification(fileMetadata)
        assertThat(modification.currentFilename).isEqualTo("src/Main.java")
        assertThat(modification.type).isEqualTo(Modification.Type.ADD)
    }

    @Test
    fun parsesFilenameFromDeletedFile() {
        val fileMetadata = "D\t src/Main.java"
        val modification = GitLogParserStrategy.parseModification(fileMetadata)
        assertThat(modification.currentFilename).isEqualTo("src/Main.java")
        assertThat(modification.type).isEqualTo(Modification.Type.DELETE)
    }

    @Test
    fun parsesFilenamesFromUnusualFileMetadata() {
        assertThat(GitLogParserStrategy.parseModification("")).isEqualTo(Modification.EMPTY)
        assertThat(GitLogParserStrategy.parseModification("  src/Main.java").currentFilename)
                .isEqualTo("src/Main.java")
    }

    companion object {

        private val FULL_COMMIT = asList(
                "commit ca1fe2ba3be4",
                "Author: TheAuthor <mail@example.com>",
                "Date:   Tue May 9 19:57:57 2017 +0200",
                "    the commit message",
                "A src/Added.java",
                "M src/Modified.java",
                "D src/Deleted.java")
    }
}
