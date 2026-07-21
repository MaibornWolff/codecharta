package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.parseWordLines

class ResourceKeywordLoader {
    fun loadFromResource(resourcePath: String): Set<String> {
        val inputStream =
            this::class.java.classLoader.getResourceAsStream(resourcePath)
                ?: throw IllegalArgumentException("Resource file not found: $resourcePath")

        return inputStream.bufferedReader().useLines { lines -> parseWordLines(lines) }
    }
}
