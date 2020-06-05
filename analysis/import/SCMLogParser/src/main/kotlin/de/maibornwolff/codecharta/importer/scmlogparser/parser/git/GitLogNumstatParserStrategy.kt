package de.maibornwolff.codecharta.importer.scmlogparser.parser.git

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogLineCollector
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.AuthorParser.AUTHOR_ROW_INDICATOR
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.CommitDateParser.DATE_ROW_INDICATOR
import mu.KotlinLogging
import java.time.OffsetDateTime
import java.util.function.Predicate
import java.util.stream.Collector
import java.util.stream.Stream
import kotlin.streams.toList

class GitLogNumstatParserStrategy : LogParserStrategy {
    override fun creationCommand(): String {
        return "git log --numstat --topo-order"
    }

    override fun createLogLineCollector(): Collector<String, *, Stream<List<String>>> {
        return LogLineCollector.create(GIT_COMMIT_SEPARATOR_TEST)
    }

    override fun parseAuthor(commitLines: List<String>): String {
        return commitLines.parallelStream()
            .filter { it.startsWith(AUTHOR_ROW_INDICATOR) }
            .map { AuthorParser.parseAuthor(it) }
            .toList()
            .first()
    }

    override fun parseModifications(commitLines: List<String>): List<Modification> {
        return commitLines
            .filter { isFileLine(it) }
            .map { parseModification(it) }
            .filter { it !== Modification.EMPTY }
    }

    override fun parseDate(commitLines: List<String>): OffsetDateTime {
        return commitLines.parallelStream()
            .filter { it.startsWith(DATE_ROW_INDICATOR) }
            .map { CommitDateParser.parseCommitDate(it) }
            .toList()
            .first()
    }

    companion object {
        private val logger = KotlinLogging.logger {}
        private const val STANDARD_FILE_LINE_REGEX = "\\d+\\s+\\d+\\s+\\S+\\s*"
        private const val RENAME_FILE_LINE_REGEX = "\\d+\\s+\\d+\\s+\\S*\\S+ => \\S+\\S*\\s*"
        private const val RENAMING_SEPARATOR = "=>"
        private const val STANDARD_FILE_LINE_SPLITTER = "\\s+"
        private const val RENAME_FILE_LINE_SPLITTER = "[{}\\s+]"
        private val GIT_COMMIT_SEPARATOR_TEST = Predicate<String> { logLine -> logLine.startsWith("commit") }
        internal fun isFileLine(commitLine: String): Boolean {
            return commitLine.length >= 5 &&
                (
                    commitLine.matches(STANDARD_FILE_LINE_REGEX.toRegex()) ||
                        commitLine.matches(RENAME_FILE_LINE_REGEX.toRegex())
                    )
        }

        internal fun parseModification(fileLine: String): Modification {
            if (fileLine.matches(STANDARD_FILE_LINE_REGEX.toRegex())) {
                return parseStandardModification(fileLine)
            } else if (fileLine.matches(RENAME_FILE_LINE_REGEX.toRegex())) {
                return parseRenameModification(fileLine)
            }

            return Modification.EMPTY
        }

        private fun String.removeDuplicateString(c: String): String {
            return this.replace(c + c, c)
        }

        private fun parseRenameModification(fileLine: String): Modification {
            val lineParts = fileLine.split(RENAME_FILE_LINE_SPLITTER.toRegex())
                .dropLastWhile({ it.isEmpty() })
            val additions = lineParts[0].toLong()
            val deletions = lineParts[1].toLong()
            var oldFileName: String
            var newFileName: String

            if (RENAMING_SEPARATOR == lineParts[4]) {
                oldFileName = lineParts[2] + lineParts[3] + if (lineParts.size > 6) lineParts[6] else ""
                if (lineParts[3].isEmpty()) {
                    oldFileName = oldFileName.removeDuplicateString("/")
                }

                newFileName = lineParts[2] + lineParts[5] + if (lineParts.size > 6) lineParts[6] else ""
                if (lineParts[5].isEmpty()) {
                    newFileName = newFileName.removeDuplicateString("/")
                }
            } else if (RENAMING_SEPARATOR == lineParts[3]) {
                oldFileName = lineParts[2]
                newFileName = lineParts[4]
            } else {
                logger.warn { "Log line could not be parsed$fileLine" }
                return Modification.EMPTY
            }

            return Modification(newFileName, oldFileName, additions, deletions, Modification.Type.RENAME)
        }

        private fun parseStandardModification(fileLine: String): Modification {
            val lineParts = fileLine.split(STANDARD_FILE_LINE_SPLITTER.toRegex())
                .dropLastWhile({ it.isEmpty() })
            val additions = lineParts[0].toLong()
            val deletions = lineParts[1].toLong()
            val filename = lineParts[2]
            return Modification(filename.trim(), additions, deletions)
        }
    }
}
