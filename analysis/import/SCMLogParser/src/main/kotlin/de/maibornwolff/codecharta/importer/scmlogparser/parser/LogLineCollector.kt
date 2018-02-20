package de.maibornwolff.codecharta.importer.scmlogparser.parser

import java.util.*
import java.util.function.*
import java.util.stream.Collector
import java.util.stream.Stream

class LogLineCollector private constructor(private val isCommitSeparator: Predicate<String>) {

    private fun collectLogLine(commits: MutableList<MutableList<String>>, logLine: String) {
        if (isCommitSeparator.test(logLine)) {
            startNewCommit(commits)
        } else {
            assertOneCommitIsPresent(commits)
            addToLastCommit(commits, logLine)
        }
    }

    private fun startNewCommit(commits: MutableList<MutableList<String>>) {
        commits.add(ArrayList())
    }

    private fun assertOneCommitIsPresent(commits: List<List<String>>) {
        if (commits.isEmpty()) {
            throw IllegalArgumentException("no commit present or parallel stream of log lines, which is not supported")
        }
    }

    private fun addToLastCommit(commits: MutableList<MutableList<String>>, logLine: String) {
        val indexOfLastCommit = commits.size - 1
        val lastCommit = commits[indexOfLastCommit]
        lastCommit.add(logLine)
    }

    private fun combineForParallelExecution(firstList: MutableList<MutableList<String>>, secondList: MutableList<MutableList<String>>): MutableList<MutableList<String>> {
        throw UnsupportedOperationException("parallel collection of log lines not supported")
    }

    private fun removeIncompleteCommits(commits: MutableList<MutableList<String>>): Stream<MutableList<String>> {
        return commits.stream().filter { commit -> !commit.isEmpty() }
    }

    companion object {

        fun create(commitSeparatorTest: Predicate<String>): Collector<String, *, Stream<List<String>>> {
            val collector = LogLineCollector(commitSeparatorTest)
            return Collector.of<String, MutableList<MutableList<String>>, Stream<List<String>>>(
                    Supplier<MutableList<MutableList<String>>> { ArrayList() },
                    BiConsumer<MutableList<MutableList<String>>, String> { commits, logLine -> collector.collectLogLine(commits, logLine) },
                    BinaryOperator<MutableList<MutableList<String>>> { firstList, secondList -> collector.combineForParallelExecution(firstList, secondList) },
                    Function<MutableList<MutableList<String>>, Stream<List<String>>> { collector.removeIncompleteCommits(it).map{ it.toList() } }
            )
        }
    }

}
