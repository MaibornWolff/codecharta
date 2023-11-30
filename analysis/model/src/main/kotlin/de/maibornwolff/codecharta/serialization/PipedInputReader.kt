package de.maibornwolff.codecharta.serialization

import java.io.InputStream

fun <R> InputStream.mapLines(transform: (String) -> R): List<R> {
    val result = mutableListOf<R>()
    forEachLine {
        result.add(transform(it))
    }
    return result
}

/*
Bash runs commands concurrently in a pipe chain, causing potential delays in input availability.
For ccsh commands, they check for piped input and wait until it's complete.
To signal piped projects, ccsh filters/importers send a blank to OutputStream at the start.
Subsequent commands detect this blank as a cue to wait.
To allow time for the preceding command to send the blank, a brief delay precedes InputStream availability checks.
*/
fun InputStream.forEachLine(action: (String) -> Unit) {
    val reader = bufferedReader()
    Thread.sleep(1000)
    while (reader.ready()) {
        action(reader.readLine())
    }
}
