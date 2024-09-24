package de.maibornwolff.codecharta.parser.gitlogparser

import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.parser.gitlogparser.converter.ProjectConverter
import de.maibornwolff.codecharta.parser.gitlogparser.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.parser.gitlogparser.parser.LogLineParser
import de.maibornwolff.codecharta.parser.gitlogparser.parser.LogParserStrategy
import de.maibornwolff.codecharta.parser.gitlogparser.parser.VersionControlledFilesList
import java.util.stream.Stream

/**
 * creates cc-Project out of Log using specific parserStrategy and metricsFactory
 */
class GitLogProjectCreator(
    parserStrategy: LogParserStrategy,
    private val metricsFactory: MetricsFactory,
    private val projectConverter: ProjectConverter,
    logSizeInByte: Long = 0,
    silent: Boolean = false
) {
    private val logLineParser: LogLineParser = LogLineParser(parserStrategy, metricsFactory, silent, logSizeInByte)

    fun parse(lines: Stream<String>, filesInLog: List<String>): Project {
        val versionControlledFilesList: VersionControlledFilesList = logLineParser.parse(lines)
        return projectConverter.convert(versionControlledFilesList, metricsFactory, filesInLog)
    }
}
