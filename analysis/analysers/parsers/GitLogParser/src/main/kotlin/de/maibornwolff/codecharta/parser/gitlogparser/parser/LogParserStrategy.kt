package de.maibornwolff.codecharta.parser.gitlogparser.parser

import de.maibornwolff.codecharta.parser.gitlogparser.input.Modification
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
