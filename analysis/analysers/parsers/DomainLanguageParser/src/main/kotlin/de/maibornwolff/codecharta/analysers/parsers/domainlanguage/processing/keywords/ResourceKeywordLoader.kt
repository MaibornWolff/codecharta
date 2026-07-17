package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords

class ResourceKeywordLoader {
    fun loadFromResource(resourcePath: String): Set<String> {
        val inputStream =
            this::class.java.classLoader.getResourceAsStream(resourcePath)
                ?: throw IllegalArgumentException("Resource file not found: $resourcePath")

        return inputStream.bufferedReader().useLines { lines ->
            lines
                .map { it.trim() }
                .filterNot { it.isEmpty() || it.startsWith("#") }
                .toSet()
        }
    }
}
