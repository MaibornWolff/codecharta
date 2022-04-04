package de.maibornwolff.codecharta.tools.interactivecli

import picocli.CommandLine

interface ParserDialogInterface {
    fun generateParserArgs(args: Array<String>, commandLine: CommandLine): Array<String>

    fun isValidFileName(fileName: String): Boolean

    fun getOutputFileName(fullFileName: String): String {
        return fullFileName.substringAfterLast("/").substringAfterLast("\\").substringBefore(".")
    }

    fun checkExtension(fileName: String, expectedFileExtension: String): Boolean {
        val fileExtension = fileName.substringAfter(".")
        return fileExtension == expectedFileExtension
    }
}
