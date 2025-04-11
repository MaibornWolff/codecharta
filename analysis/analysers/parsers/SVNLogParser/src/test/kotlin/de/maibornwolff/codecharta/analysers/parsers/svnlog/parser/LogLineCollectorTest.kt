package de.maibornwolff.codecharta.analysers.parsers.svnlog.parser

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import java.util.function.Predicate
import java.util.stream.Stream

class LogLineCollectorTest {
    @Test
    fun `collects between separators`() {
        val logLines = Stream.of("##", "commit 1", "##", "commit 2")
        val collector = LogLineCollector.create { logLine -> logLine == "##" }
        val commits = logLines.collect(collector)
        assertThat(commits).containsExactly(listOf("commit 1"), listOf("commit 2"))
    }

    @Test
    fun `raises exception when no commit separator present`() {
        val logLines = Stream.of("commit 1", "commit 2")
        val commitSeparatorTest = Predicate<String> { logLine -> logLine == "some commit separator" }
        assertThatThrownBy { logLines.collect(LogLineCollector.create(commitSeparatorTest)) }.isInstanceOf(
            IllegalArgumentException::class.java
        )
    }

    @Test
    fun `skips empty lines`() {
        val logLinesWithEmptyOneInTheMiddle = Stream.of("--", "commit data", "", "commit comment", "--")
        val collector = LogLineCollector.create { string -> string == "--" }
        val commits = logLinesWithEmptyOneInTheMiddle.collect(collector)
        assertThat(commits).hasSize(1)
    }

    @Test
    fun `does not support parallel streams`() {
        val logLines = Stream.of("--", "commit 1").parallel()
        val collector = LogLineCollector.create { logLine -> logLine == "--" }
        assertThatThrownBy { logLines.collect(collector) }.isInstanceOf(IllegalArgumentException::class.java)
    }

    @Test
    fun `BOM is removed`() {
        val logLines = Stream.of("\uFEFF---", "whatever")
        val collector = LogLineCollector.create { logLine -> logLine.startsWith("---") }
        val commits = logLines.collect(collector)
        assertThat(commits).hasSize(1)
    }
}
