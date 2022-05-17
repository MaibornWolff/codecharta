package de.maibornwolff.codecharta.tools.interactiveparser

interface ParserDialogInterface {
    fun collectParserArgs(): List<String>

    fun getOutputFileName(fullFileName: String): String {
        return fullFileName.substringAfterLast("/").substringAfterLast("\\").substringBefore(".")
    }
}
