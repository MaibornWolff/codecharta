package de.maibornwolff.codecharta.serialization

import java.io.InputStream
import java.lang.StringBuilder
import java.util.Scanner

/*
Bash runs commands concurrently in a pipe chain, causing potential delays in input availability.
For ccsh commands, they check for piped input and wait until it's complete.
To signal piped projects, ccsh filters/importers send a blank to OutputStream at the start.
Subsequent commands detect this blank as a cue to wait.
To allow time for the preceding command to send the blank, a brief delay precedes InputStream availability checks.
*/
fun InputStream.readNonBlockingInput(): String {
    Thread.sleep(1000)
    val availableBytes = available()

    if (availableBytes <= 0) {
        return ""
    }

    val maxBufferSize = 1024
    val bufferSize = minOf(availableBytes, maxBufferSize)
    val buffer = ByteArray(bufferSize)
    mark(bufferSize)
    read(buffer, 0, bufferSize)

    val startSignal = " "
    val startSignalBytes = startSignal.toByteArray()
    val isStartSignalContained = buffer.containsSubarray(startSignalBytes)

    if (!isStartSignalContained) {
        return ""
    }

    reset()
    val scanner = Scanner(this)
    val result = StringBuilder()

    while (scanner.hasNextLine()) {
        val line = scanner.nextLine()
        if (line.contains("\"checksum\":") || line.contains("\"data\":")) {
            result.append(line)
            while (scanner.hasNextLine()) {
                result.append(scanner.nextLine())
            }
            break
        }
    }

    return result.toString()
}

fun ByteArray.containsSubarray(subarray: ByteArray): Boolean {
    for (i in 0 until size - subarray.size + 1) {
        if (copyOfRange(i, i + subarray.size).contentEquals(subarray)) {
            return true
        }
    }
    return false
}
