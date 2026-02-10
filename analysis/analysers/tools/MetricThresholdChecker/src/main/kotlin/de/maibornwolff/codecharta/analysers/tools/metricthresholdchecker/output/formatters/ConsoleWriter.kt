package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters

import java.io.PrintStream

interface ConsoleWriter {
    fun println(text: String = "")
}

class PrintStreamConsoleWriter(private val printStream: PrintStream) : ConsoleWriter {
    override fun println(text: String) {
        printStream.println(text)
    }
}
