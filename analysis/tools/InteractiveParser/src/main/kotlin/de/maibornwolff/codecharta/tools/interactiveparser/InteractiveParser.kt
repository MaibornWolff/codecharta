package de.maibornwolff.codecharta.tools.interactiveparser

interface InteractiveParser {
    fun getDialog(): ParserDialogInterface

    fun isApplicable(resourceToBeParsed: String): Boolean

    fun getName(): String
}
