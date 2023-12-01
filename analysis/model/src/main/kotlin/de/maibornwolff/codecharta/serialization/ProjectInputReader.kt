package de.maibornwolff.codecharta.serialization

import java.io.InputStream
import java.lang.StringBuilder

/*
Bash runs commands concurrently in a pipe chain, causing potential delays in input availability.
For ccsh commands, they check for piped input and wait until it's complete.
To signal piped projects, ccsh filters/importers send a blank to OutputStream at the start.
Subsequent commands detect this blank as a cue to wait.
To allow time for the preceding command to send the blank, a brief delay precedes InputStream availability checks.
*/
fun InputStream.readNonBlockingInput(): String {
    Thread.sleep(1000)
    val result = StringBuilder()
    val reader = bufferedReader()
    while (reader.ready()) {
        result.append(reader.readLine())
    }
    return result.toString()
}
