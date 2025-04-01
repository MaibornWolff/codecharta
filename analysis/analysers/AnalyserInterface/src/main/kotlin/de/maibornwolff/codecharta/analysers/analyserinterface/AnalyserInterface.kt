package de.maibornwolff.codecharta.analysers.analyserinterface

interface AnalyserInterface {
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
