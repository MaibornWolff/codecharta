package de.maibornwolff.codecharta.analysers.tools.ccsh.parser.repository

import de.maibornwolff.codecharta.analysers.tools.interactiveparser.InteractiveParser

interface ParserRepository<T> {
    fun getInteractiveParserNames(dataSource: T): List<String>

    fun getInteractiveParserNamesWithDescription(dataSource: T): List<String>

    fun extractParserName(parserNameWithDescription: String): String

    fun getAllInteractiveParsers(dataSource: T): List<InteractiveParser>

    fun getApplicableParsers(inputFile: String, allParsers: List<InteractiveParser>): List<InteractiveParser>

    fun getApplicableInteractiveParserNamesWithDescription(inputFile: String, allParsers: List<InteractiveParser>): List<String>

    fun getInteractiveParser(dataSource: T, name: String): InteractiveParser?
}
