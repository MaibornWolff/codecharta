package de.maibornwolff.codecharta.importer.sourcecodeparser

import picocli.CommandLine

enum class OutputType {
    JSON, TABLE
}

class OutputTypeConverter : CommandLine.ITypeConverter<OutputType> {
    override fun convert(value: String?): OutputType = when {
        OutputType.TABLE.name.equals(value, ignoreCase = true) -> OutputType.TABLE
        OutputType.JSON.name.equals(value, ignoreCase = true) -> OutputType.JSON
        else -> {
            println("Using default ${OutputType.JSON.name.toLowerCase()}"); OutputType.JSON
        }
    }
}