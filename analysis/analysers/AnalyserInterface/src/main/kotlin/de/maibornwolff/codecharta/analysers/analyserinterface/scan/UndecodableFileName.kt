package de.maibornwolff.codecharta.analysers.analyserinterface.scan

import de.maibornwolff.codecharta.util.Logger
import java.io.File

object UndecodableFileName {
    private const val REPLACEMENT_CHARACTER = '�'
    private const val FILE_NAME_ENCODING_PROPERTY = "sun.jnu.encoding"

    fun reportIfUndecodable(entry: File): Boolean {
        val isUndecodable = REPLACEMENT_CHARACTER in entry.name && !entry.exists()
        if (isUndecodable) {
            Logger.warn {
                "Skipping ${entry.path}: its name cannot be decoded with the file name encoding " +
                    "${System.getProperty(FILE_NAME_ENCODING_PROPERTY)}, run ccsh under a UTF-8 locale such as LC_ALL=C.UTF-8"
            }
        }
        return isUndecodable
    }
}
