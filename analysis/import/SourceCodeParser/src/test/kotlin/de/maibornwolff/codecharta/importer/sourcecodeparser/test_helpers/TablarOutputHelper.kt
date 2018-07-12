package de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers

fun elementsOf(text: String) = text.split(' ').filter { it.isNotEmpty() }