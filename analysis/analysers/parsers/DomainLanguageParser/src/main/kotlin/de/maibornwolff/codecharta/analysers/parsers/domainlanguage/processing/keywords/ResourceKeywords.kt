package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords

/**
 * A parameterized keyword provider that loads keywords from a resource file.
 *
 * This class replaces all individual language keyword classes (KotlinKeywords, JavaKeywords, etc.)
 * with a single reusable implementation that takes the resource path as a constructor parameter.
 *
 * @param resourcePath The path to the keyword resource file (e.g., "keywords/kotlin-keywords.txt")
 */
class ResourceKeywords(private val resourcePath: String) : LanguageKeywords {
    private val cachedKeywords: Set<String> by lazy {
        ResourceKeywordLoader().loadFromResource(resourcePath)
    }

    override fun getKeywords(): Set<String> = cachedKeywords
}
