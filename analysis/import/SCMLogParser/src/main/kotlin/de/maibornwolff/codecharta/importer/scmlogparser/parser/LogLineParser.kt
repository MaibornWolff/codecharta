package de.maibornwolff.codecharta.importer.scmlogparser.parser

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import java.time.OffsetDateTime
import java.util.stream.Stream

/**
 * Parses log lines and generates VersionControlledFiles from them using specific parserStrategy and metricsFactory
 */
class LogLineParser(private val parserStrategy: LogParserStrategy, private val metricsFactory: MetricsFactory, private val silent: Boolean = false) {

    private var numberOfCommitsParsed = 0

    fun parse(logLines: Stream<String>): List<VersionControlledFile> {
        return logLines.collect(parserStrategy.createLogLineCollector())
                .map { this.parseCommit(it) }
                .collect(CommitCollector.create(metricsFactory))
    }

    internal fun parseCommit(commitLines: List<String>): Commit {
        val author = parserStrategy.parseAuthor(commitLines)
        val commitDate = parserStrategy.parseDate(commitLines)
        val modifications = parserStrategy.parseModifications(commitLines)
        if (!silent) showProgress(commitDate)
        return Commit(author, modifications, commitDate)
    }

    private fun showProgress(date: OffsetDateTime) {
        System.err.print("\r$numberOfCommitsParsed commits parsed. (Latest commit from $date)       ")
        numberOfCommitsParsed++
    }
}