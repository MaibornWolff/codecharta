package de.maibornwolff.codecharta.analysers.parsers.svnlog

import de.maibornwolff.codecharta.analysers.parsers.svnlog.converter.ProjectConverter
import de.maibornwolff.codecharta.analysers.parsers.svnlog.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.analysers.parsers.svnlog.parser.LogLineParser
import de.maibornwolff.codecharta.analysers.parsers.svnlog.parser.LogParserStrategy
import de.maibornwolff.codecharta.model.Project
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
