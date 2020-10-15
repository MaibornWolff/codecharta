package de.maibornwolff.codecharta.importer.scmlogparser.parser

import de.maibornwolff.codecharta.ProgressTracker
import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification
import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
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
    private val silent: Boolean = false,
    private val logSizeInByte: Long = 0
) {

    private var currentBytesParsed = 0L
    private val progressTracker: ProgressTracker = ProgressTracker()
    private val parsingUnit = "Byte"

    fun parse(logLines: Stream<String>): List<VersionControlledFile> {
        val parsedCommit = logLines.collect(parserStrategy.createLogLineCollector())
            .map { this.parseCommit(it) }.filter { !it.isEmpty }
            .collect(CommitCollector.create(metricsFactory))

        progressTracker.updateProgress(logSizeInByte, logSizeInByte, parsingUnit)

        return parsedCommit
    }

    internal fun parseCommit(commitLines: List<String>): Commit {
        return try {
            var author = ""
            var commitDate = OffsetDateTime.now()
            var modifications: List<Modification> = listOf()

            runBlocking(Dispatchers.Default) {
                launch {
                    author = parserStrategy.parseAuthor(commitLines)
                    commitDate = parserStrategy.parseDate(commitLines)
                    modifications = parserStrategy.parseModifications(commitLines)
                }
            }

            commitLines.forEach {
                currentBytesParsed += it.length
            }

            if (!silent) progressTracker.updateProgress(logSizeInByte, currentBytesParsed, parsingUnit)
            Commit(author, modifications, commitDate)
        } catch (e: NoSuchElementException) {
            System.err.println("Skipped commit with invalid syntax ($commitLines)")
            Commit("", listOf(), OffsetDateTime.now())
        }
    }
}
