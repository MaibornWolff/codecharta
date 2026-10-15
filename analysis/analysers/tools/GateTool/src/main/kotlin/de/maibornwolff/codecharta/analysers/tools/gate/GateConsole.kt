package de.maibornwolff.codecharta.analysers.tools.gate

import java.io.OutputStream
import java.io.PrintStream

class GateConsole(val output: PrintStream, private val quiet: Boolean) {
    fun println(line: String = "") {
        output.println(line)
    }

    fun announceAnalysis(line: String) {
        if (quiet) output.println(line)
    }

    fun <T> whileAnalysing(action: () -> T): T {
        if (!quiet) return action()
        val originalOut = System.out
        val originalErr = System.err
        val nowhere = PrintStream(OutputStream.nullOutputStream())
        System.setOut(nowhere)
        System.setErr(nowhere)
        try {
            return action()
        } finally {
            System.setOut(originalOut)
            System.setErr(originalErr)
        }
    }
}
