package de.maibornwolff.codecharta.analysers.tools.ccsh.parser.repository

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface

interface ParserRepository<T> {
    fun getAnalyserInterfaceNames(dataSource: T): List<String>

    fun getAnalyserInterfaceNamesWithDescription(dataSource: T): List<String>

    fun extractParserName(parserNameWithDescription: String): String

    fun getAllAnalyserInterfaces(dataSource: T): List<AnalyserInterface>

    fun getApplicableParsers(inputFile: String, allParsers: List<AnalyserInterface>): List<AnalyserInterface>

    fun getApplicableAnalyserNamesWithDescription(inputFile: String, allParsers: List<AnalyserInterface>): List<String>

    fun getAnalyserInterface(dataSource: T, name: String): AnalyserInterface?
}
