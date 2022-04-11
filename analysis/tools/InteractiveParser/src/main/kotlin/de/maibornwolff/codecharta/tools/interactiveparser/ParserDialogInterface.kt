package de.maibornwolff.codecharta.tools.interactiveparser

interface ParserDialogInterface {
    fun collectParserArgs(): List<String>

    fun isValidFileName(fileName: String): Boolean

    fun getOutputFileName(fullFileName: String): String {
        return fullFileName.substringAfterLast("/").substringAfterLast("\\").substringBefore(".")
    }

    fun hasExpectedExtension(fileName: String, expectedFileExtension: String): Boolean {
        val fileExtension = fileName.substringAfter(".")
        return fileExtension == expectedFileExtension
    }
}
