package de.maibornwolff.codecharta.importer.sourcecodeparser

import java.io.ByteArrayOutputStream
import java.io.PrintStream

fun retrieveStreamAsString(aMethod: (printStream: PrintStream) -> Unit): String{
    val baOutputStream = ByteArrayOutputStream()
    val printStream = PrintStream(baOutputStream)

    aMethod(printStream)

    return baOutputStream.toString()
}