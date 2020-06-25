package de.maibornwolff.codecharta.importer.scmlogparser.parser.git

import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy
import de.maibornwolff.codecharta.importer.scmlogparser.parser.ParserStrategyContractTest
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.util.Lists
import org.junit.Test
import java.util.Arrays.asList
import java.util.stream.Stream

class GitLogNumstatParserStrategyTest : ParserStrategyContractTest() {

    private var parserStrategy: GitLogNumstatParserStrategy = GitLogNumstatParserStrategy()

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
        val fileMetadata = "0 10\t src/Main.java"
        val modification = GitLogNumstatParserStrategy.parseModification(fileMetadata)
        assertThat(modification.filename).isEqualTo("src/Main.java")
    }

    @Test
    fun parsesFilenamesFromUnusualFileMetadata() {
        assertThat(GitLogNumstatParserStrategy.parseModification("0\t10\tsrc/Main.java").filename)
                .isEqualTo("src/Main.java")
    }

    @Test
    fun isFilelineWorksForStandardExamples() {
        assertThat(GitLogNumstatParserStrategy.isFileLine("0\t10\tsrc/Main.java")).isTrue()
        assertThat(GitLogNumstatParserStrategy.isFileLine("0\t10\tsrc/Main.java ")).isTrue()
    }

    companion object {

        private val FULL_COMMIT = asList(
                "commit ca1fe2ba3be4",
                "Author: TheAuthor <mail@example.com>",
                "Date:   Tue May 9 19:57:57 2017 +0200",
                "    the commit message",
                "10 0 src/Added.java",
                "2 1 src/Modified.java",
                "0 20 src/Deleted.java")
    }
}
