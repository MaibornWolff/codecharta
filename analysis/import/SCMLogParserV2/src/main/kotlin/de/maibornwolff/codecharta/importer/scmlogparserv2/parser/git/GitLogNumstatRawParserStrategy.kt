package de.maibornwolff.codecharta.importer.scmlogparserv2.parser.git

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Modification
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.LogLineCollector
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.LogParserStrategy
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.git.AuthorParser.AUTHOR_ROW_INDICATOR
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.git.CommitDateParser.DATE_ROW_INDICATOR
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.git.MergeCommitDetector.MERGE_COMMIT_INDICATOR
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.git.helper.GitLogNumstatParsingHelper
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.git.helper.GitLogRawParsingHelper
import java.time.OffsetDateTime
import java.util.function.Predicate
import java.util.stream.Collector
import java.util.stream.Stream

class GitLogNumstatRawParserStrategy : LogParserStrategy {
    override fun creationCommand(): String {
        return "git log --numstat --raw --topo-order --reverse -m"
    }

    override fun createLogLineCollector(): Collector<String, *, Stream<List<String>>> {
        return LogLineCollector.create(GIT_COMMIT_SEPARATOR_TEST)
    }

    override fun parseAuthor(commitLines: List<String>): String {
        val authorLine = commitLines.first { commitLine -> commitLine.startsWith(AUTHOR_ROW_INDICATOR) }
        return AuthorParser.parseAuthor(authorLine)
    }

    override fun parseModifications(commitLines: List<String>): List<Modification> {
        return commitLines
            .mapNotNull {
                if (isFileLine(it)) {
                    parseModification(it)
                } else null
            }
            .groupingBy { it.currentFilename }
            .aggregate { _, aggregatedModification: Modification?, currentModification, _ ->
                when (aggregatedModification) {
                    null -> mergeModifications(currentModification)
                    else -> mergeModifications(aggregatedModification, currentModification)
                }
            }
            .values
            .toList()
    }

    override fun parseDate(commitLines: List<String>): OffsetDateTime {
        val dateLine = commitLines.first { commitLine -> commitLine.startsWith(DATE_ROW_INDICATOR) }
        return CommitDateParser.parseCommitDate(dateLine)
    }

    override fun parseIsMergeCommit(commitLines: List<String>): Boolean {
        return commitLines.any { commitLine -> commitLine.startsWith(MERGE_COMMIT_INDICATOR) }
    }

    companion object {

        private val GIT_COMMIT_SEPARATOR_TEST = Predicate<String> { logLine -> logLine.startsWith("commit") }
        private fun isFileLine(commitLine: String): Boolean {
            return GitLogRawParsingHelper.isFileLine(commitLine) || GitLogNumstatParsingHelper.isFileLine(commitLine)
        }

        internal fun parseModification(fileLine: String): Modification {
            return if (fileLine.startsWith(":")) {
                GitLogRawParsingHelper.parseModification(fileLine)
            } else GitLogNumstatParsingHelper.parseModification(fileLine)
        }

        private fun mergeModifications(vararg a: Modification): Modification {
            val filename = a[0].currentFilename
            val additions = a.map { it.additions }.sum()
            val deletions = a.map { it.deletions }.sum()

            val tmpModification = a.firstOrNull { modification -> modification.type != Modification.Type.UNKNOWN }
            var type = Modification.Type.UNKNOWN

            if (tmpModification != null) {
                type = tmpModification.type
            }

            if (type == Modification.Type.RENAME) {

                val temporaryModification = a.firstOrNull { modification -> modification.oldFilename.isNotEmpty() }
                var oldFilename = ""

                if (temporaryModification != null) {
                    oldFilename = temporaryModification.oldFilename
                }

                return Modification(filename, oldFilename, additions, deletions, type)
            }

            return Modification(filename, additions, deletions, type)
        }
    }
}
