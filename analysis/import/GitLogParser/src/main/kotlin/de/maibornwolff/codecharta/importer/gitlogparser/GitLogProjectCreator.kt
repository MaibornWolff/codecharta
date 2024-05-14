package de.maibornwolff.codecharta.importer.gitlogparser

import de.maibornwolff.codecharta.importer.gitlogparser.converter.ProjectConverter
import de.maibornwolff.codecharta.importer.gitlogparser.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.importer.gitlogparser.parser.LogLineParser
import de.maibornwolff.codecharta.importer.gitlogparser.parser.LogParserStrategy
import de.maibornwolff.codecharta.importer.gitlogparser.parser.VersionControlledFilesList
import de.maibornwolff.codecharta.model.Project
import java.util.stream.Stream

/**
 * creates cc-Project out of Log using specific parserStrategy and metricsFactory
 */
class GitLogProjectCreator(
        parserStrategy: LogParserStrategy,
        private val metricsFactory: MetricsFactory,
        private val projectConverter: ProjectConverter,
        logSizeInByte: Long = 0,
        silent: Boolean = false,
                          ) {
                          private val logLineParser: LogLineParser = LogLineParser(parserStrategy, metricsFactory, silent, logSizeInByte)

    fun parse(
    lines: Stream<String>,
    filesInLog: List<String>,
    ): Project {
        val versionControlledFilesList: VersionControlledFilesList = logLineParser.parse(lines)
        return projectConverter.convert(versionControlledFilesList, metricsFactory, filesInLog)
    }
}
