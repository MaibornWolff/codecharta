package de.maibornwolff.codecharta.analysers.parsers.gitlog.parser

import java.util.function.Predicate
import java.util.stream.Collector
import java.util.stream.Stream

class LogLineCollector private constructor(private val isCommitSeparator: Predicate<String>) {
    private fun collectLogLine(commits: MutableList<MutableList<String>>, logLine: String) {
        val sanitizedLogLine = sanitizeLogLine(logLine)
        if (isCommitSeparator.test(sanitizedLogLine)) {
            startNewCommit(commits)
        } else {
            assertOneCommitIsPresent(commits)
            addToLastCommit(commits, sanitizedLogLine)
        }
    }

    private fun sanitizeLogLine(logLine: String): String {
        if (logLine.startsWith(BOM)) return logLine.substring(1)
        return logLine
    }

    private fun startNewCommit(commits: MutableList<MutableList<String>>) {
        commits.add(ArrayList())
    }

    private fun assertOneCommitIsPresent(commits: List<List<String>>) {
        if (commits.isEmpty()) {
            throw IllegalArgumentException(
                "no commit present, unsupported file encoding, or parallel stream of log lines"
            )
        }
    }

    private fun addToLastCommit(commits: List<MutableList<String>>, logLine: String) {
        val indexOfLastCommit = commits.size - 1
        val lastCommit = commits[indexOfLastCommit]
        lastCommit.add(logLine)
    }

    private fun removeIncompleteCommits(commits: MutableList<MutableList<String>>): Stream<MutableList<String>> {
        return commits.stream().filter { commit -> commit.isNotEmpty() }
    }

    companion object {
        fun create(commitSeparatorTest: Predicate<String>): Collector<String, *, Stream<List<String>>> {
            val collector = LogLineCollector(commitSeparatorTest)
            return Collector.of<String, MutableList<MutableList<String>>, Stream<List<String>>>(
                { ArrayList() },
                { commits, logLine ->
                    collector.collectLogLine(commits, logLine)
                },
                { _, _ ->
                    throw UnsupportedOperationException("parallel collection of log lines not supported")
                },
                { mutableList ->
                    collector.removeIncompleteCommits(mutableList).map { it.toList() }
                }
            )
        }

        private const val BOM = "\uFEFF"
    }
}
