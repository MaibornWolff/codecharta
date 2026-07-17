package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.input

import java.io.File

class FileFilter(private val allowedExtensions: List<String>) {
    fun matchesExtension(file: File): Boolean = allowedExtensions.any { ext ->
        file.name.endsWith(".$ext", ignoreCase = true)
    }
}
