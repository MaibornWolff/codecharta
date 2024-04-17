package de.maibornwolff.codecharta.tools.interactiveparser

interface InteractiveParser {
val name: String
    val description: String

    fun getDialog(): ParserDialogInterface

    fun isApplicable(resourceToBeParsed: String): Boolean

    fun getParserName(): String {
        return name
    }

    fun getParserDescription(): String {
        return description
    }
}
