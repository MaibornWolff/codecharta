package de.maibornwolff.codecharta.tools.ccsh.parser.repository

import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
interface ParserRepository<T> {
    fun getInteractiveParserNames(dataSource: T): List<String>
    fun getInteractiveParserNamesWithDescription(dataSource: T): List<String>
    fun extractParserName(parserNameWithDescription: String): String
    fun getAllInteractiveParsers(dataSource: T): List<InteractiveParser>
    fun getApplicableInteractiveParserNames(inputFile: String, allParsers: List<InteractiveParser>): List<String>
    fun getInteractiveParser(dataSource: T, name: String): InteractiveParser?
}
