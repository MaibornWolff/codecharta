package de.maibornwolff.codecharta.tools.interactiveparser

interface ParserDialogInterface {
    // change interactive cli name
    fun collectParserArgs(): List<String>

    fun isValidFileName(fileName: String): Boolean

    fun getOutputFileName(fullFileName: String): String {
        return fullFileName.substringAfterLast("/").substringAfterLast("\\").substringBefore(".")
    }

    fun checkExtension(fileName: String, expectedFileExtension: String): Boolean {
        val fileExtension = fileName.substringAfter(".")
        return fileExtension == expectedFileExtension
    }
}
