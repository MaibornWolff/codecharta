package de.maibornwolff.codecharta.parser.svnlogparser

import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.parser.svnlogparser.converter.ProjectConverter
import de.maibornwolff.codecharta.parser.svnlogparser.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.parser.svnlogparser.parser.LogLineParser
import de.maibornwolff.codecharta.parser.svnlogparser.parser.LogParserStrategy
import java.util.stream.Stream

/**
 * creates cc-Project out of Log using specific parserStrategy and metricsFactory
 */
class SVNLogProjectCreator(
    parserStrategy: LogParserStrategy,
    private val metricsFactory: MetricsFactory,
    private val projectConverter: ProjectConverter,
    logSizeInByte: Long = 0,
    silent: Boolean = false
) {
    private val logLineParser: LogLineParser = LogLineParser(parserStrategy, metricsFactory, silent, logSizeInByte)

    fun parse(lines: Stream<String>): Project {
        val versionControlledFiles = logLineParser.parse(lines)
        return projectConverter.convert(versionControlledFiles, metricsFactory)
    }
}
