package de.maibornwolff.codecharta.importer.sourcecodeparser

fun elementsOf(text: String) = text.split(' ').filter { it.isNotEmpty() }