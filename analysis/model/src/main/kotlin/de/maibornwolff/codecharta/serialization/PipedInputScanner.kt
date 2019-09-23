package de.maibornwolff.codecharta.serialization

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
    Thread.sleep(1000)
    if (available() <= 0) return // Otherwise it will get stuck waiting for user input
    while (scanner.hasNext()) {
        action(scanner.nextLine())
    }
}