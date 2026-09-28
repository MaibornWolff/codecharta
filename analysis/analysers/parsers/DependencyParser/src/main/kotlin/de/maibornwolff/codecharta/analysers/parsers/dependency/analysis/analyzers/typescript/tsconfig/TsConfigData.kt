package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.tsconfig

import java.io.File

data class TsConfigData(val compilerOptions: CompilerOptions? = null, val extends: String? = null) {
    companion object {
        val EMPTY = TsConfigData()
    }
}

data class TsConfigResult(val data: TsConfigData, val file: File)

data class CompilerOptions(val baseUrl: String? = null, val paths: Map<String, List<String>>? = null)
