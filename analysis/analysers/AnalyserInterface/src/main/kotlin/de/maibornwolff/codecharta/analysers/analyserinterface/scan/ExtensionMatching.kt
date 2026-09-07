package de.maibornwolff.codecharta.analysers.analyserinterface.scan

fun matchesAnyExtension(fileName: String, extensions: Collection<String>): Boolean = extensions.any { extension ->
    fileName.endsWith(".$extension", ignoreCase = true)
}
