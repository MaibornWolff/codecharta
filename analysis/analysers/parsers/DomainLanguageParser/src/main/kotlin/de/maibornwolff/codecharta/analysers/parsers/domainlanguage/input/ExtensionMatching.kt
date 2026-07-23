package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.input

internal fun matchesAnyExtension(name: String, extensions: Collection<String>): Boolean = extensions.any { extension ->
    name.endsWith(".$extension", ignoreCase = true)
}
