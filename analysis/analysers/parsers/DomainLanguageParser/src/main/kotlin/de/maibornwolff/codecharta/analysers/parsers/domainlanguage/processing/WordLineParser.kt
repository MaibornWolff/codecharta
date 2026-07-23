package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

internal fun parseWordLines(lines: Sequence<String>): Set<String> = lines
    .map { it.trim() }
    .filterNot { it.isEmpty() || it.startsWith("#") }
    .toSet()
