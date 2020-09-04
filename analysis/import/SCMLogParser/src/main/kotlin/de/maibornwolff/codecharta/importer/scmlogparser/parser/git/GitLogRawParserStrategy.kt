package de.maibornwolff.codecharta.importer.scmlogparser.parser.git

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogLineCollector
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.AuthorParser.AUTHOR_ROW_INDICATOR
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.CommitDateParser.DATE_ROW_INDICATOR
import java.time.OffsetDateTime
import java.util.function.Predicate
import java.util.stream.Collector
import java.util.stream.Stream

class GitLogRawParserStrategy : LogParserStrategy {

    override fun creationCommand(): String {
        return "git log --raw --topo-order --reverse"
    }

    override fun createLogLineCollector(): Collector<String, *, Stream<List<String>>> {
        return LogLineCollector.create(GIT_COMMIT_SEPARATOR_TEST)
    }

    override fun parseAuthor(commitLines: List<String>): String {
        return commitLines
                .filter { commitLine -> commitLine.startsWith(AUTHOR_ROW_INDICATOR) }
                .map { AuthorParser.parseAuthor(it) }
                .first()
    }

    override fun parseModifications(commitLines: List<String>): List<Modification> {
        return commitLines
                .filter { isFileLine(it) }
                .map { parseModification(it) }
    }

    override fun parseDate(commitLines: List<String>): OffsetDateTime {
        return commitLines
                .filter { commitLine -> commitLine.startsWith(DATE_ROW_INDICATOR) }
                .map { CommitDateParser.parseCommitDate(it) }
                .first()
    }

    override fun parseIsMergeCommit(commitLines: List<String>): Boolean {
        //@TODO not implemented yet
        return false
    }

    companion object {

        private const val FILE_LINE_REGEX = ":\\d+\\s+\\d+\\s+\\S+\\s+\\S+\\s+.+"
        private val GIT_COMMIT_SEPARATOR_TEST = Predicate<String> { logLine -> logLine.startsWith("commit") }
        private const val FILE_LINE_SPLITTER = "\\s+"

        internal fun isFileLine(commitLine: String): Boolean {
            return commitLine.length >= 5 && commitLine.matches(FILE_LINE_REGEX.toRegex())
        }

        internal fun parseModification(fileLine: String): Modification {
            val lineParts = fileLine.split(FILE_LINE_SPLITTER.toRegex()).dropLastWhile({ it.isEmpty() }).toTypedArray()
            val status = Status.byCharacter(lineParts[4].trim({ it <= ' ' })[0])

            return if (status == Status.RENAMED) {
                Modification(lineParts[6].trim({ it <= ' ' }), lineParts[5].trim({ it <= ' ' }),
                        status.toModificationType())
            } else Modification(lineParts[5].trim({ it <= ' ' }), status.toModificationType())
        }
    }
}
