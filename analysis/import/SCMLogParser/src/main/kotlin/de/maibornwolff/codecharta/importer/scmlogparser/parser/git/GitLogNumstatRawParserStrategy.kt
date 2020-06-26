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
import kotlin.streams.toList

class GitLogNumstatRawParserStrategy : LogParserStrategy {
    override fun creationCommand(): String {
        return "git log --numstat --raw --topo-order"
    }

    override fun createLogLineCollector(): Collector<String, *, Stream<List<String>>> {
        return LogLineCollector.create(GIT_COMMIT_SEPARATOR_TEST)
    }

    override fun parseAuthor(commitLines: List<String>): String {
        return commitLines
            .parallelStream()
            .filter { commitLine -> commitLine.startsWith(AUTHOR_ROW_INDICATOR) }
            .map { AuthorParser.parseAuthor(it) }
            .toList()
            .first()
    }

    override fun parseModifications(commitLines: List<String>): List<Modification> {
        return commitLines
            .filter { isFileLine(it) }
            .map { parseModification(it) }
            .groupingBy { it.filename }
            .aggregate { _, aggregatedModification: Modification?, currentModification, _ ->
                when (aggregatedModification) {
                    null -> mergeModifications(currentModification)
                    else -> mergeModifications(aggregatedModification, currentModification)
                }
            }
            .values
            .filterNotNull()
            .toList()
    }

    override fun parseDate(commitLines: List<String>): OffsetDateTime {
        return commitLines
            .filter { commitLine -> commitLine.startsWith(DATE_ROW_INDICATOR) }
            .map { CommitDateParser.parseCommitDate(it) }
            .first()
    }

    companion object {
        private val GIT_COMMIT_SEPARATOR_TEST = Predicate<String> { logLine -> logLine.startsWith("commit") }
        private fun isFileLine(commitLine: String): Boolean {
            return GitLogRawParserStrategy.isFileLine(commitLine) || GitLogNumstatParserStrategy.isFileLine(commitLine) }

        internal fun parseModification(fileLine: String): Modification {
            return if (fileLine.startsWith(":")) {
                GitLogRawParserStrategy.parseModification(fileLine)
            } else GitLogNumstatParserStrategy.parseModification(fileLine)
        }

        private fun mergeModifications(vararg a: Modification): Modification {
            val filename = a[0].filename
            val additions = a.map { it.additions }.sum()
            val deletions = a.map { it.deletions }.sum()
            val type =
                a.map { it.type }.firstOrNull { t -> t != Modification.Type.UNKNOWN } ?: Modification.Type.UNKNOWN

            if (type == Modification.Type.RENAME) {
                val oldFilename = a.map { it.oldFilename }.firstOrNull { s -> s.isNotEmpty() } ?: ""
                return Modification(filename, oldFilename, additions, deletions, type)
            }

            return Modification(filename, additions, deletions, type)
        }
    }
}
