package de.maibornwolff.codecharta.importer.scmlogparserv2.parser.git.helper

import de.maibornwolff.codecharta.importer.scmlogparserv2.input.Modification
import de.maibornwolff.codecharta.importer.scmlogparserv2.parser.git.Status

class GitLogRawParsingHelper {
    companion object {

        private const val FILE_LINE_REGEX = ":\\d+\\s+\\d+\\s+\\S+\\s+\\S+\\s+.+"
        private const val FILE_LINE_SPLITTER = " "

        fun isFileLine(commitLine: String): Boolean {
            return commitLine.length >= 5 && commitLine.matches(FILE_LINE_REGEX.toRegex())
        }

        fun parseModification(fileLine: String): Modification {
            val lineParts = fileLine.split(FILE_LINE_SPLITTER.toRegex()).toTypedArray()

            var combinedLineParts = lineParts[4]
            for (pos in 5 until lineParts.size) {
                combinedLineParts += ' ' + lineParts[pos]
            }

            val modificationParts = combinedLineParts.split('\t').toTypedArray()
            val status = Status.byCharacter(modificationParts[0].trim({ it <= ' ' })[0])
            return if (status == Status.RENAMED) {

                Modification(
                    modificationParts[2].trim({ it <= ' ' }),
                    modificationParts[1].trim({ it <= ' ' }),
                    status.toModificationType()
                )
            } else Modification(modificationParts[1].trim({ it <= ' ' }), status.toModificationType())
        }
    }
}
