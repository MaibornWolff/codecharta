package de.maibornwolff.codecharta.filter.structuremodifier

import java.io.InputStream
import java.util.*

fun <R> InputStream.mapLines(transform: (String) -> R): List<R> {
    println("hi")
    val result = mutableListOf<R>()
    forEachLine {
        result.add(transform(it))
    }
    return result
}

fun InputStream.forEachLine(action: (String) -> Unit) {
    // stop reading when no input available,
    // catch is needed since we are retrieving piped and not piped input
    val scanner = Scanner(this)
    while (available() > 0) {
        try {
            action(scanner.nextLine())
        } catch (e: NoSuchElementException) {
            println("NoSuchElementException catched")
            break
        }
    }
}