package de.maibornwolff.codecharta.tools.interactiveparser

interface InteractiveParser {
    fun getDialog(): ParserDialogInterface

    fun isUsable(inputFile: String): Boolean

    fun getName(): String
}
