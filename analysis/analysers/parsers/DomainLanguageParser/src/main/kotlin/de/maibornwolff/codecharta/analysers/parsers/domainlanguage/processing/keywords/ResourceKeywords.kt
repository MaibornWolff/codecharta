package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords

class ResourceKeywords(private val resourcePath: String) : LanguageKeywords {
    private val cachedKeywords: Set<String> by lazy {
        ResourceKeywordLoader().loadFromResource(resourcePath)
    }

    override fun getKeywords(): Set<String> = cachedKeywords
}
