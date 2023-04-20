package de.maibornwolff.codecharta.tools.ccsh.parser.repository

import de.maibornwolff.codecharta.tools.interactiveparser.InteractiveParser
interface IParserRepository<T> {
    fun getParserNames(dataSource: T): List<String>
    fun getParserNamesWithDescription(dataSource: T): List<String>
    fun extractParserName(parserNameWithDescription: String): String
    fun getAllParsers(dataSource: T): List<InteractiveParser>
    fun getUsableParserNames(inputFile: String, allParsers: List<InteractiveParser>): List<String>
    fun getParser(dataSource: T, name: String): InteractiveParser?
}
