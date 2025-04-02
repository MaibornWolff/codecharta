package de.maibornwolff.codecharta.ccsh.parser.repository

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface

interface AnalyserRepository<T> {
    fun getAnalyserInterfaceNames(dataSource: T): List<String>

    fun getAnalyserInterfaceNamesWithDescription(dataSource: T): List<String>

    fun extractAnalyserName(analyserNameWithDescription: String): String

    fun getAllAnalyserInterfaces(dataSource: T): List<AnalyserInterface>

    fun getApplicableAnalysers(inputFile: String, allAnalysers: List<AnalyserInterface>): List<AnalyserInterface>

    fun getApplicableAnalyserNamesWithDescription(inputFile: String, allAnalysers: List<AnalyserInterface>): List<String>

    fun getAnalyserInterface(dataSource: T, name: String): AnalyserInterface?
}
