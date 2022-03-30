package de.maibornwolff.codecharta.tools.interactivecli

import picocli.CommandLine

interface ParserDialogInterface {
    fun generateDialog(args: Array<String>, commandLine: CommandLine): Int

    fun isValidFileName(fileName: String): Boolean

    fun getOutputFileName(fullFileName: String): String {
        if (fullFileName.contains("/")) {
            return fullFileName.substringAfterLast("/").substringBefore(".")
        }
        if (fullFileName.contains("\\")) {
            return fullFileName.substringAfterLast("\\").substringBefore(".")
        }
        return fullFileName.substringBefore(".")
    }

    fun checkExtension(fileName: String, expectedFileExtension: String): Boolean {
        val fileExtension = fileName.substringAfter(".")
        return fileExtension == expectedFileExtension
    }
}
