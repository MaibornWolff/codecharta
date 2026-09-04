package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common

import java.io.File

fun splitNameToParts(name: String): List<String> {
    val pathWithSlashes = File(name).invariantSeparatorsPath
    return pathWithSlashes.split("/").map { it.trim() }.filter { it.isNotEmpty() }
}
