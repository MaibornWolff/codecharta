package de.maibornwolff.codecharta.util

import picocli.CommandLine

class FileExtensionConverter : CommandLine.ITypeConverter<List<String>> {
override fun convert(value: String?): List<String> {
        if (value != null) {
            return value.split(",").map { e -> e.trim() }.map { e -> e.removePrefix(".") }
                    .filter { e -> e.isNotEmpty() }
        }
        return listOf()
    }
}
