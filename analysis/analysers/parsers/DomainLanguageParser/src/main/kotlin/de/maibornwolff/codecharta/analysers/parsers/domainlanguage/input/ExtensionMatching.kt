package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.input

/** True when [name] ends with a case-insensitive `.<ext>` for any of [extensions]. */
internal fun matchesAnyExtension(name: String, extensions: Collection<String>): Boolean = extensions.any { extension ->
    name.endsWith(".$extension", ignoreCase = true)
}
