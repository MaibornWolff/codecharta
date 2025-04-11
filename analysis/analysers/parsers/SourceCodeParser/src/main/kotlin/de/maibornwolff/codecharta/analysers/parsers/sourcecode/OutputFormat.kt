package de.maibornwolff.codecharta.analysers.parsers.sourcecode

import picocli.CommandLine
import java.util.Locale

enum class OutputFormat {
    JSON,
    CSV
}

class OutputTypeConverter : CommandLine.ITypeConverter<OutputFormat> {
    override fun convert(value: String?): OutputFormat = when {
        OutputFormat.CSV.name.equals(value, ignoreCase = true) -> OutputFormat.CSV
        OutputFormat.JSON.name.equals(value, ignoreCase = true) -> OutputFormat.JSON
        else -> {
            System.err.println("Using default ${OutputFormat.JSON.name.lowercase(Locale.getDefault())}")
            OutputFormat.JSON
        }
    }
}
