package de.maibornwolff.codecharta.importer.scmlogparserv2.parser.git

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Modification
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.LogParserStrategy
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.ParserStrategyContractTest
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.util.Lists
import org.junit.Before
import org.junit.Test
import java.util.Arrays.asList
import java.util.stream.Stream

class GitLogRawParserStrategyTest : ParserStrategyContractTest() {

    private var parserStrategy: GitLogRawParserStrategy = GitLogRawParserStrategy()

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

    @Before
    fun setup() {
        parserStrategy = GitLogRawParserStrategy()
    }

    @Test
    fun parsesFilenameFromFileMetadata() {
        val fileMetadata = ":100644 100644 afb6ce4... b1c5aa3... M  src/Main.java"
        val modification = GitLogRawParserStrategy.parseModification(fileMetadata)
        assertThat(modification.currentFilename).isEqualTo("src/Main.java")
        assertThat(modification.type).isEqualTo(Modification.Type.MODIFY)
    }

    @Test
    fun parsesFilenameFromFileMetadataWithRename() {
        val fileMetadata = ":100644 100644 e7ab6f3... 0c5845c... R079 srcs/Main.java src/Main.java"
        val modification = GitLogRawParserStrategy.parseModification(fileMetadata)
        assertThat(modification.currentFilename).isEqualTo("src/Main.java")
        assertThat(modification.oldFilename).isEqualTo("srcs/Main.java")
        assertThat(modification.type).isEqualTo(Modification.Type.RENAME)
    }

    @Test
    fun parsesFilenameFromAddedFile() {
        val fileMetadata = ":100644 100644 afb6ce4... b1c5aa3... A  src/Main.java"
        val modification = GitLogRawParserStrategy.parseModification(fileMetadata)
        assertThat(modification.currentFilename).isEqualTo("src/Main.java")
        assertThat(modification.type).isEqualTo(Modification.Type.ADD)
    }

    @Test
    fun parsesFilenameFromDeletedFile() {
        val fileMetadata = ":100644 100644 64d6a85... 8c57f3d... D  src/Util.java"
        val modification = GitLogRawParserStrategy.parseModification(fileMetadata)
        assertThat(modification.currentFilename).isEqualTo("src/Util.java")
        assertThat(modification.type).isEqualTo(Modification.Type.DELETE)
    }

    companion object {

        private val FULL_COMMIT = asList(
            "commit ca1fe2ba3be4",
            "Author: TheAuthor <mail@example.com>",
            "Date:   Tue May 9 19:57:57 2017 +0200",
            "    the commit message",
            ":100644 100644 afb6ce4... b1c5aa3... A  src/Added.java",
            ":100644 100644 6c30570... 79b6243... M  src/Modified.java",
            ":100644 100644 64d6a85... 8c57f3d... D  src/Deleted.java"
        )
    }
}
