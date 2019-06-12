package de.maibornwolff.codecharta.filter.structuremodifier

import java.io.InputStream
import java.util.*

fun <R> InputStream.mapLines(transform: (String) -> R): List<R> {
    val result = mutableListOf<R>()
    forEachLine {
        result.add(transform(it))
    }
    return result
}

fun InputStream.forEachLine(action: (String) -> Unit) {
    val scanner = Scanner(this)
    if (available() <= 0) return // Otherwise it will get stuck waiting for user input
    while (scanner.hasNext()) {
        action(scanner.nextLine())
    }
}