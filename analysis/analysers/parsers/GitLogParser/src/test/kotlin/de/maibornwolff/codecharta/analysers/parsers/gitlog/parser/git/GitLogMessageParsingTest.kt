package de.maibornwolff.codecharta.analysers.parsers.gitlog.parser.git

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class GitLogMessageParsingTest {
    @Test
    fun should_parse_single_line_commit_message() {
        // given
        val strategy = GitLogNumstatRawParserStrategy()
        val commitLines = listOf(
            "commit abc123",
            "Author: John Doe <john@example.com>",
            "Date:   Fri Mar 17 11:22:49 2017 +0100",
            "",
            "    feat: add new feature",
            "",
            ":000000 100644 000000000 7c37bb421 A\tfile.txt"
        )

        // when
        val message = strategy.parseMessage(commitLines)

        // then
        assertThat(message).isEqualTo("feat: add new feature")
    }

    @Test
    fun should_parse_multi_line_commit_message() {
        // given
        val strategy = GitLogNumstatRawParserStrategy()
        val commitLines = listOf(
            "commit abc123",
            "Author: John Doe <john@example.com>",
            "Date:   Fri Mar 17 11:22:49 2017 +0100",
            "",
            "    feat: add new feature",
            "",
            "    This is a detailed description",
            "    of the new feature implementation.",
            "",
            ":000000 100644 000000000 7c37bb421 A\tfile.txt"
        )

        // when
        val message = strategy.parseMessage(commitLines)

        // then
        assertThat(message).isEqualTo("feat: add new feature\nThis is a detailed description\nof the new feature implementation.")
    }

    @Test
    fun should_handle_empty_commit_message() {
        // given
        val strategy = GitLogNumstatRawParserStrategy()
        val commitLines = listOf(
            "commit abc123",
            "Author: John Doe <john@example.com>",
            "Date:   Fri Mar 17 11:22:49 2017 +0100",
            "",
            ":000000 100644 000000000 7c37bb421 A\tfile.txt"
        )

        // when
        val message = strategy.parseMessage(commitLines)

        // then
        assertThat(message).isEmpty()
    }

    @Test
    fun should_ignore_non_message_lines() {
        // given
        val strategy = GitLogNumstatRawParserStrategy()
        val commitLines = listOf(
            "commit abc123",
            "Author: John Doe <john@example.com>",
            "Date:   Fri Mar 17 11:22:49 2017 +0100",
            "",
            "    fix: resolve issue",
            "",
            ":000000 100644 000000000 7c37bb421 A\tfile.txt",
            "1\t0\tfile.txt"
        )

        // when
        val message = strategy.parseMessage(commitLines)

        // then
        assertThat(message).isEqualTo("fix: resolve issue")
    }
}
