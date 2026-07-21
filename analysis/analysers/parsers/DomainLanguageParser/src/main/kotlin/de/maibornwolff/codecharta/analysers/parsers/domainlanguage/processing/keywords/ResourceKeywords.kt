package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords

/**
 * A keyword provider that loads its word list from a resource file, so a new language needs a
 * resource rather than a class.
 *
 * @param resourcePath The path to the keyword resource file (e.g., "keywords/kotlin-keywords.txt")
 */
class ResourceKeywords(private val resourcePath: String) : LanguageKeywords {
    private val cachedKeywords: Set<String> by lazy {
        ResourceKeywordLoader().loadFromResource(resourcePath)
    }

    override fun getKeywords(): Set<String> = cachedKeywords
}
