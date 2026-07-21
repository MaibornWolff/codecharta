package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.LanguageKeywords
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.ResourceKeywordLoader
import java.nio.file.Path
import java.util.concurrent.ConcurrentHashMap

class StopWordFilter(
    private val languageKeywords: List<LanguageKeywords> = emptyList(),
    private val customStopWords: Set<String> = emptySet(),
    private val keywordLoader: ResourceKeywordLoader = ResourceKeywordLoader(),
    private val pathScopedKeywordProvider: PathScopedKeywordProvider = PathScopedKeywordProvider.NONE
) {
    private val stopWords: Set<String> by lazy {
        keywordLoader.loadFromResource("stopwords/english-stopwords.txt")
    }

    private val allExcludedWords: Set<String> by lazy {
        val languageKeywordSet = languageKeywords.flatMap { it.getKeywords() }.toSet()
        stopWords + languageKeywordSet + customStopWords
    }

    private val pathExcludedWordsCache = ConcurrentHashMap<Path, Set<String>>()

    fun isExcluded(word: String, filePath: Path): Boolean = isExcludedFrom(word, getExcludedWordsForPath(filePath))

    private fun isExcludedFrom(word: String, excludedWords: Set<String>): Boolean {
        if (word in excludedWords) return true
        if (word.contains(' ')) {
            return word.split(' ').any { it in excludedWords }
        }
        return false
    }

    private fun getExcludedWordsForPath(filePath: Path): Set<String> = pathExcludedWordsCache.computeIfAbsent(filePath) { path ->
        val frameworkKeywords =
            pathScopedKeywordProvider
                .getFrameworkKeywordsForFile(path)
                .flatMap { it.getKeywords() }
                .toSet()
        allExcludedWords + frameworkKeywords
    }

    fun clearCache() {
        pathExcludedWordsCache.clear()
    }
}
