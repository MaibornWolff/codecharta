package de.maibornwolff.codecharta.importer.sourcecodeparser

import java.io.ByteArrayOutputStream
import java.io.PrintStream

fun retrieveOutputAndErrorStream(aMethod: () -> Unit): Pair<String, String>{
    // IMPORTANT: Save the old System.out!
    val oldOutputStream = System.out
    val baOutputStream = ByteArrayOutputStream()
    System.setOut(PrintStream(baOutputStream))
    // IMPORTANT: Save the old System.err!
    val oldErrorStream = System.err
    val baErrorStream = ByteArrayOutputStream()
    System.setErr(PrintStream(baErrorStream))

    aMethod()

    System.out.flush()
    System.setOut(oldOutputStream)
    System.err.flush()
    System.setErr(oldErrorStream)

    return Pair(baOutputStream.toString(), baErrorStream.toString())
}

fun retrieveStreamAsString(aMethod: (printStream: PrintStream) -> Unit): String{
    val baOutputStream = ByteArrayOutputStream()
    val printStream = PrintStream(baOutputStream)

    aMethod(printStream)

    return baOutputStream.toString()
}