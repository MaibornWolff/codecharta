package de.maibornwolff.codecharta.serialization

import java.io.InputStream
import java.util.* // ktlint-disable no-wildcard-imports

fun <R> InputStream.mapLines(transform: (String) -> R): List<R> {
    val result = mutableListOf<R>()
    forEachLine {
        result.add(transform(it))
    }
    return result
}

// Bash runs commands in a pipe chain in parallel. This means that the input may not be available/complete at the
// time of reading it.
// The ccsh commands need to determine whether there is piped input or not. If there is, it should wait until the
// input is complete. To indicate that there will be a piped project, the filters/importers of ccsh send a blank to
// their OutputStream as soon as they start. This is detected by potentially following commands and is taken as a
// sign to wait. In order to give the preceding command time to send this blank, we wait for some time before
// checking the availability of the InputStream.
fun InputStream.forEachLine(action: (String) -> Unit) {
    val scanner = Scanner(this)
    Thread.sleep(1000)
    if (available() <= 0) return // Otherwise it will get stuck waiting for user input
    while (scanner.hasNext()) {
        action(scanner.nextLine())
    }
}