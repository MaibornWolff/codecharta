package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

/**
 * The shared rule for reading a keyword/stopword text file: trim each line, then drop blank lines and
 * '#' comment lines. Both the bundled keyword resources and user-supplied .dlcignore files use this
 * format, so the parsing lives in one place and cannot drift between the two loaders.
 */
internal fun parseWordLines(lines: Sequence<String>): Set<String> = lines
    .map { it.trim() }
    .filterNot { it.isEmpty() || it.startsWith("#") }
    .toSet()
