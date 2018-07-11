package de.maibornwolff.codecharta.importer.sourcecodeparser

import java.io.ByteArrayOutputStream
import java.io.OutputStreamWriter
import java.io.PrintStream
import java.io.Writer

fun retrieveWriterAsString(aMethod: (printStream: Writer) -> Unit): String{
    val baOutputStream = ByteArrayOutputStream()
    val printStream = PrintStream(baOutputStream)

    aMethod(OutputStreamWriter(printStream))

    return baOutputStream.toString()
}

fun retrieveStreamAsString(aMethod: (printStream: PrintStream) -> Unit): String{
    val baOutputStream = ByteArrayOutputStream()
    val printStream = PrintStream(baOutputStream)

    aMethod(printStream)

    return baOutputStream.toString()
}