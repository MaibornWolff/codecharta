package de.maibornwolff.codecharta.importer.scmlogparser

import de.maibornwolff.codecharta.importer.scmlogparser.converter.ProjectConverter
import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogLineParser
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy
import de.maibornwolff.codecharta.model.Project
import java.util.stream.Stream

/**
 * creates cc-Project out of Log using specific parserStrategy and metricsFactory
 */
class SCMLogProjectCreator(
    parserStrategy: LogParserStrategy,
    private val metricsFactory: MetricsFactory,
    private val projectConverter: ProjectConverter,
    silent: Boolean = false
) {

    private val logLineParser: LogLineParser = LogLineParser(parserStrategy, metricsFactory, silent)

    fun parse(lines: Stream<String>): Project {
        val versionControlledFiles : MutableMap<String,VersionControlledFile> = logLineParser.parse(lines)
        return projectConverter.convert(versionControlledFiles, metricsFactory)
    }
}
