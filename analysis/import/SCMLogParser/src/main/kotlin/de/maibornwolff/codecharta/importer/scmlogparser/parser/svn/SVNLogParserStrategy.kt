package de.maibornwolff.codecharta.importer.scmlogparser.parser.svn

import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogLineCollector
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy
import org.apache.commons.lang3.StringUtils
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeFormatterBuilder
import java.util.function.Predicate
import java.util.stream.Collector
import java.util.stream.Stream

class SVNLogParserStrategy: LogParserStrategy {

    override fun parseDate(commitLines: List<String>): OffsetDateTime {
        return commitLines
                .filter { this.isMetadataLine(it) }
                .map { this.parseCommitDate(it) }
                .first()
    }

    private fun parseCommitDate(metadataLine: String): OffsetDateTime {
        val splittedLine =
                metadataLine.split(("\\" + METADATA_SEPARATOR).toRegex()).dropLastWhile{ it.isEmpty() }.toTypedArray()
        val commitDateAsString =
                splittedLine[DATE_INDEX_IN_METADATA].trim{ it <= ' ' }.replace(" \\(.*\\)".toRegex(), "")
        return OffsetDateTime.parse(commitDateAsString, DATE_TIME_FORMATTER)
    }

    override fun parseAuthor(commitLines: List<String>): String {
        return commitLines
                .filter { this.isMetadataLine(it) }
                .map { this.parseAuthor(it) }
                .first()
    }

    private fun isMetadataLine(commitLine: String): Boolean {
        return commitLine.startsWith('r') && commitLine.count { it == METADATA_SEPARATOR } >= 3
    }

    private fun parseAuthor(authorLine: String): String {
        val splittedLine =
                authorLine.split(("\\" + METADATA_SEPARATOR).toRegex()).dropLastWhile{ it.isEmpty() }.toTypedArray()
        return splittedLine[AUTHOR_INDEX_IN_METADATA].trim{ it <= ' ' }
    }

    override fun parseModifications(commitLines: List<String>): List<Modification> {
        return commitLines
                .filter { this.isFileLine(it) }
                .map { this.parseModification(it) }
    }

    private fun isFileLine(commitLine: String): Boolean {
        val commitLineWithoutWhitespacePrefix = stripWhitespacePrefix(commitLine)
        if (commitLineWithoutWhitespacePrefix.length < 3) {
            return false
        }
        val firstChar = commitLineWithoutWhitespacePrefix[0]
        val secondChar = commitLineWithoutWhitespacePrefix[1]
        val thirdChar = commitLineWithoutWhitespacePrefix[2]
        return isStatusLetter(firstChar) && Character.isWhitespace(secondChar) && isSlash(thirdChar)
    }

    internal fun parseModification(fileLine: String): Modification {
        val metadataWithoutWhitespacePrefix = stripWhitespacePrefix(fileLine)
        val status = Status.byCharacter(metadataWithoutWhitespacePrefix[0])
        val metadataWithoutStatusLetter = metadataWithoutWhitespacePrefix.substring(1)
        val trimmedFileLine = removeDefaultRepositoryFolderPrefix(metadataWithoutStatusLetter.trim{ it <= ' ' })

        return when(trimmedFileLine.contains(RENAME_FILE_LINE_IDENTIFIER)) {
            true ->  parseRenameModification(trimmedFileLine)
            else ->  parseStandardModification(trimmedFileLine, status)
        }
    }

    private fun parseStandardModification(filePath: String, status: Status): Modification {
        return ignoreIfRepresentsFolder(Modification(filePath, status.toModificationType()))
    }

    private fun parseRenameModification(filePathLine: String): Modification {
        val fileNames = filePathLine.split(RENAME_FILE_LINE_IDENTIFIER)
        val oldFileNameWithPrefix = fileNames.last().split(":").first()
        val oldFileName = removeDefaultRepositoryFolderPrefix(oldFileNameWithPrefix)
        val newFileName = fileNames.first()

        return ignoreIfRepresentsFolder(Modification(newFileName, oldFileName, Modification.Type.RENAME))
    }

    override fun creationCommand(): String {
        return "svn log --verbose"
    }

    override fun createLogLineCollector(): Collector<String, *, Stream<List<String>>> {
        return LogLineCollector.create(SVN_COMMIT_SEPARATOR_TEST)
    }

    companion object {

        private const val RENAME_FILE_LINE_IDENTIFIER = " (from "
        private val SVN_COMMIT_SEPARATOR_TEST =
                Predicate<String> { logLine -> logLine.isNotEmpty() && StringUtils.containsOnly(logLine, '-') && logLine.length > 70 }
        private val DEFAULT_REPOSITORY_FOLDER_PREFIXES = arrayOf("/branches/", "/tags/", "/trunk/", "/")
        private val DATE_TIME_FORMATTER = DateTimeFormatterBuilder()
                .parseCaseInsensitive()
                .append(DateTimeFormatter.ISO_LOCAL_DATE)
                .appendLiteral(' ')
                .append(DateTimeFormatter.ISO_LOCAL_TIME)
                .appendLiteral(' ')
                .appendOffset("+HHMM", "")
                .toFormatter()
        private const val AUTHOR_INDEX_IN_METADATA = 1
        private const val DATE_INDEX_IN_METADATA = 2
        private const val METADATA_SEPARATOR = '|'

        private fun stripWhitespacePrefix(string: String): String {
            return StringUtils.stripStart(string, null)
        }

        private fun isStatusLetter(character: Char): Boolean {
            return Status.ALL_STATUS_LETTERS.contains(character)
        }

        private fun isSlash(char: Char): Boolean {
            return char == '/'
        }

        private fun removeDefaultRepositoryFolderPrefix(path: String): String {
            return DEFAULT_REPOSITORY_FOLDER_PREFIXES
                           .firstOrNull { path.startsWith(it) }
                           ?.let { path.substring(it.length) }
                   ?: path
        }

        private fun ignoreIfRepresentsFolder(modification: Modification): Modification {
            return if (!modification.filename.contains(".")) {
                Modification.EMPTY
            } else modification
        }
    }
}
