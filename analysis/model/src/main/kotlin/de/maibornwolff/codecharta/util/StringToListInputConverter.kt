package de.maibornwolff.codecharta.util

import picocli.CommandLine

class StringToListInputConverter : CommandLine.ITypeConverter<List<String>> {
    override fun convert(value: String?): List<String>? {
        if (value != null) {
            return value.split(",")
                    .map { e -> e.trim() }
                    .filter { e -> e.isNotEmpty() }
        }
        return listOf()
    }
}
