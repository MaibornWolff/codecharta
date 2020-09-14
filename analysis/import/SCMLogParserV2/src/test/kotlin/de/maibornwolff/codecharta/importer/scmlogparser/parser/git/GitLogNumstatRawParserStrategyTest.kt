package de.maibornwolff.codecharta.importer.scmlogparser.parser.git

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy
import de.maibornwolff.codecharta.importer.scmlogparser.parser.ParserStrategyContractTest
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.util.Lists
import org.junit.Test
import java.util.Arrays.asList
import java.util.function.Function
import java.util.stream.Stream

class GitLogNumstatRawParserStrategyTest : ParserStrategyContractTest() {

    private var parserStrategy: GitLogNumstatRawParserStrategy = GitLogNumstatRawParserStrategy()

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
    fun parsesFilenameFromFileMetadataNumstat() {
        val fileMetadata = "0 10\t src/Main.java"
        val modification = GitLogNumstatRawParserStrategy.parseModification(fileMetadata)
        assertThat(modification.currentFilename).isEqualTo("src/Main.java")
    }

    @Test
    fun parsesFilenameFromFileMetadataRaw() {
        val fileMetadata = ":100644 100644 afb6ce4... b1c5aa3... A  src/Added.java"
        val modification = GitLogNumstatRawParserStrategy.parseModification(fileMetadata)
        assertThat(modification.currentFilename).isEqualTo("src/Added.java")
    }

    @Test
    fun aggregateNumstatAndRaw() {
        val commitLines = asList(
            "commit ca1fe2ba3be4",
            "Author: TheAuthor <mail@example.com>",
            "Date:   Tue May 9 19:57:57 2017 +0200",
            "    the commit message",
            "10 0 src/Added.java",
            ":100644 100644 afb6ce4... b1c5aa3... A  src/Added.java"
        )
        val modifications = parserStrategy.parseModifications(commitLines)
        assertThat(modifications).hasSize(1)
        val modification = modifications[0]
        assertThat(modification).extracting(Function<Modification, Any> { it.currentFilename },
                Function<Modification, Any> { it.oldFilename },
                Function<Modification, Any> { it.type },
                Function<Modification, Any> { it.additions },
                Function<Modification, Any> { it.deletions })
                .containsExactly("src/Added.java", "", Modification.Type.ADD, 10L, 0L)
    }

    @Test
    fun aggregateNumstatAndRawWithRename() {
        val commitLines = asList(
            "commit ca1fe2ba3be4",
            "Author: TheAuthor <mail@example.com>",
            "Date:   Tue May 9 19:57:57 2017 +0200",
            "    the commit message",
            "9 2 src/{RenameOld.java => RenameNew.java}",
            ":100644 100644 e7ab6f3... 0c5845c... R079 src/RenameOld.java src/RenameNew.java"
        )
        val modifications = parserStrategy.parseModifications(commitLines)
        assertThat(modifications).hasSize(1)
        val modification = modifications[0]
        assertThat(modification).extracting(Function<Modification, Any> { it.currentFilename },
                Function<Modification, Any> { it.oldFilename },
                Function<Modification, Any> { it.type },
                Function<Modification, Any> { it.additions },
                Function<Modification, Any> { it.deletions })
                .containsExactly("src/RenameNew.java", "src/RenameOld.java", Modification.Type.RENAME, 9L, 2L)
    }

    companion object {

        private val FULL_COMMIT = asList(
            "commit ca1fe2ba3be4",
            "Author: TheAuthor <mail@example.com>",
            "Date:   Tue May 9 19:57:57 2017 +0200",
            "    the commit message",
            "10 0 src/Added.java",
            "2 1 src/Modified.java",
            "0 20 src/Deleted.java",
            ":100644 100644 afb6ce4... b1c5aa3... A  src/Added.java",
            ":100644 100644 6c30570... 79b6243... M  src/Modified.java",
            ":100644 100644 64d6a85... 8c57f3d... D  src/Deleted.java"
        )
    }
}
