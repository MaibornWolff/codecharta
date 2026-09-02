package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.input

import java.io.File

// A single file is a legal input, but the directory around it still defines the analysis: `.dlcignore`,
// framework detection and the paths words are keyed by are all relative to it.
fun rootDirectoryOf(input: File): File = if (input.isFile) input.absoluteFile.parentFile else input
