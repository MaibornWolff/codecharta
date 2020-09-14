package de.maibornwolff.codecharta.importer.scmlogparserv2.parser.git.helper

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Modification
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.git.Status

class GitLogRawParsingHelper {
    companion object {

        private const val FILE_LINE_REGEX = ":\\d+\\s+\\d+\\s+\\S+\\s+\\S+\\s+.+"
        private const val FILE_LINE_SPLITTER = "\\s+"

        internal fun isFileLine(commitLine: String): Boolean {
            return commitLine.length >= 5 && commitLine.matches(FILE_LINE_REGEX.toRegex())
        }

        internal fun parseModification(fileLine: String): Modification {
            val lineParts = fileLine.split(FILE_LINE_SPLITTER.toRegex()).dropLastWhile({ it.isEmpty() }).toTypedArray()
            val status = Status.byCharacter(lineParts[4].trim({ it <= ' ' })[0])

            return if (status == Status.RENAMED) {
                Modification(
                    lineParts[6].trim({ it <= ' ' }),
                    lineParts[5].trim({ it <= ' ' }),
                    status.toModificationType()
                )
            } else Modification(lineParts[5].trim({ it <= ' ' }), status.toModificationType())
        }
    }
}
