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

class GitLogParserStrategy : LogParserStrategy {
    override fun creationCommand(): String {
        return "git log --name-status --topo-order"
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

    companion object {
        private val GIT_COMMIT_SEPARATOR_TEST = Predicate<String> { logLine -> logLine.startsWith("commit") }
        private const val FILE_LINE_REGEX = "\\w\\d*\\s+\\S+(.*|\\s+\\S+.*)"
        private fun isStatusLetter(character: Char): Boolean {
            return Status.ALL_STATUS_LETTERS.contains(character)
        }

        private fun isFileLine(commitLine: String): Boolean {
            return commitLine.length >= 3 && commitLine.matches(FILE_LINE_REGEX.toRegex()) && isStatusLetter(
                commitLine[0]
            )
        }

        internal fun parseModification(fileLine: String): Modification {
            if (fileLine.isEmpty()) {
                return Modification.EMPTY
            }
            val status = Status.byCharacter(fileLine[0])
            val lineParts = fileLine.split("\\s+".toRegex())

            return if (status == Status.RENAMED) Modification(
                lineParts[2].trim(), lineParts[1].trim(),
                status.toModificationType()
            )
            else Modification(lineParts[1].trim(), status.toModificationType())
        }
    }
}
