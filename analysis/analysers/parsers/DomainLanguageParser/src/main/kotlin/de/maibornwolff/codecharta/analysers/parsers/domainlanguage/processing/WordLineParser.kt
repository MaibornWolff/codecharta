package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

// Lowercased because SplitStage sanitizes every extracted word to lower case before it is compared:
// an entry that keeps its capitals (`False`, `String`, `Hash`) could never match anything.
internal fun parseWordLines(lines: Sequence<String>): Set<String> = lines
    .map { it.trim() }
    .filterNot { it.isEmpty() || it.startsWith("#") }
    .mapTo(mutableSetOf()) { it.lowercase() }
