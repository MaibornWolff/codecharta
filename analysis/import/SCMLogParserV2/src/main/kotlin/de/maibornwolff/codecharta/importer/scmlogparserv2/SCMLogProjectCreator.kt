package de.maibornwolff.codecharta.importer.scmlogparserv2

import de.maibornwolff.codecharta.importer.scmlogparserv2.converter.ProjectConverter
import de.maibornwolff.codecharta.importer.scmlogparserv2.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.LogLineParser
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.LogParserStrategy
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.VersionControlledFilesList
import de.maibornwolff.codecharta.model.Project
import java.util.stream.Stream

/**
 * creates cc-Project out of Log using specific parserStrategy and metricsFactory
 */
class SCMLogProjectCreator(
    parserStrategy: LogParserStrategy,
    private val metricsFactory: MetricsFactory,
    private val projectConverter: ProjectConverter,
    logSizeInByte : Long = 0,
    silent: Boolean = false
) {

    private val logLineParser: LogLineParser = LogLineParser(parserStrategy, metricsFactory, silent, logSizeInByte)

    fun parse(lines: Stream<String>, filesInLog: List<String>): Project {
        val versionControlledFilesList: VersionControlledFilesList = logLineParser.parse(lines)
        return projectConverter.convert(versionControlledFilesList, metricsFactory, filesInLog)
    }
}
