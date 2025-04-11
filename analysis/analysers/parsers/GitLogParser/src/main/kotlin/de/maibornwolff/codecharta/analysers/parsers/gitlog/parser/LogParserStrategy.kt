package de.maibornwolff.codecharta.analysers.parsers.gitlog.parser

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.Modification
import java.time.OffsetDateTime
import java.util.stream.Collector
import java.util.stream.Stream

interface LogParserStrategy {
    fun creationCommand(): String

    fun createLogLineCollector(): Collector<String, *, Stream<List<String>>>

    fun parseAuthor(commitLines: List<String>): String

    fun parseModifications(commitLines: List<String>): List<Modification>

    fun parseDate(commitLines: List<String>): OffsetDateTime

    fun parseIsMergeCommit(commitLines: List<String>): Boolean
}
