package de.maibornwolff.codecharta.tools.interactivecli

import picocli.CommandLine

interface ParserDialog {
    fun generateDialog(args: Array<String>, commandLine: CommandLine): Int
    fun validateFileName(fileName: String): Boolean
}
