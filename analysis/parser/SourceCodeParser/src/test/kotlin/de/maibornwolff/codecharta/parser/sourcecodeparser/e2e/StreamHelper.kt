package de.maibornwolff.codecharta.parser.sourcecodeparser.e2e

import java.io.ByteArrayOutputStream
import java.io.PrintStream

class StreamHelper {
    companion object {
        fun retrieveStreamAsString(aMethod: (printStream: PrintStream) -> Unit): String {
            val baOutputStream = ByteArrayOutputStream()
            val printStream = PrintStream(baOutputStream)

            aMethod(printStream)

            return baOutputStream.toString()
        }
    }
}
