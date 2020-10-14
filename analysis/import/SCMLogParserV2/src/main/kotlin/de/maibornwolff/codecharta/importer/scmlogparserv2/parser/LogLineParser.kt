package de.maibornwolff.codecharta.importer.scmlogparserv2.parser

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Modification
import de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics.MetricsFactory
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import java.time.OffsetDateTime
import java.util.stream.Stream

/**
 * Parses log lines and generates VersionControlledFiles from them using specific parserStrategy and metricsFactory
 */
class LogLineParser(
    private val parserStrategy: LogParserStrategy,
    private val metricsFactory: MetricsFactory,
    private val silent: Boolean = false
) {

    private var numberOfCommitsParsed = 0

    fun parse(logLines: Stream<String>): VersionControlledFilesList {
        return logLines.collect(parserStrategy.createLogLineCollector())
            .map { this.parseCommit(it) }.filter { !it.isEmpty }
            .collect(CommitCollector.create(metricsFactory))
    }

    internal fun parseCommit(commitLines: List<String>): Commit {
        return try {
            var author = ""
            var commitDate = OffsetDateTime.MIN
            var modifications: List<Modification> = listOf()
            var isMergeCommit = false

            runBlocking(Dispatchers.Default) {
                launch {
                    author = parserStrategy.parseAuthor(commitLines)
                    commitDate = parserStrategy.parseDate(commitLines)
                    modifications = parserStrategy.parseModifications(commitLines)
                    isMergeCommit = parserStrategy.parseIsMergeCommit(commitLines)
                }
            }

            if (!silent) showProgress(commitDate)
            Commit(author, modifications, commitDate, isMergeCommit)
        } catch (e: NoSuchElementException) {
            System.err.println("Skipped commit with invalid syntax ($commitLines)")
            Commit("", listOf(), OffsetDateTime.now())
        }
    }

    private fun showProgress(date: OffsetDateTime) {
        System.err.print("\r$numberOfCommitsParsed commits parsed. (Latest commit from $date)       ")
        numberOfCommitsParsed++
    }
}
